import type {
  DevtoolProbe,
  SceneNode,
  FrameStats,
  BenchmarkScore,
  SceneSnapshot,
  MemoryStats,
  RenderingStats,
  PerformanceMetrics,
  ResourceLifecycleEvent,
  ResourceLifecycleSummary,
  ResourceType,
  LeakAlert,
  LeakReport,
  PluginManager,
  DevtoolPlugin,
  PluginId,
  PanelDefinition as CorePanelDefinition,
  ToolbarActionDefinition,
} from '@3lens/core';
import { calculateBenchmarkScore } from '@3lens/core';

import {
  formatNumber,
  formatBytes,
  getObjectIcon,
  getObjectClass,
} from '../utils/format';
import { OVERLAY_STYLES } from '../styles/styles';
import {
  VirtualScroller,
  type FlattenedNode,
  VIRTUAL_SCROLL_STYLES,
  countTreeNodes,
} from '../utils/virtual-scroll';
import {
  renderMaterialsPanel,
  attachMaterialsEvents,
  renderGeometryPanel,
  attachGeometryEvents,
  renderTexturesPanel,
  attachTexturesEvents,
  renderRenderTargetsPanel,
  attachRenderTargetsEvents,
  getSharedStyles,
  createDefaultUIState,
  type UIState,
  type PanelContext,
  type PanelCommand,
} from '@3lens/ui';

export type OverlayLayoutMode = 'fab' | 'sidebar';

export interface OverlayOptions {
  probe: DevtoolProbe;
  /**
   * Layout mode for the overlay UI.
   * - 'fab': Floating Action Button with menu (default, bottom-right)
   * - 'sidebar': Sidebar layout with collapsible panel dock
   *
   * @default 'fab'
   */
  layoutMode?: OverlayLayoutMode;
  /**
   * Optional custom panel definitions to register at startup.
   *
   * Panels registered here will appear alongside the built-in Scene and
   * Performance panels in the overlay menu.
   */
  panels?: OverlayPanelDefinition[];
  /**
   * Optional list of built-in panel IDs to enable.
   *
   * When specified, only these panels will appear in the menu.
   * This is useful for examples or focused debugging sessions where
   * you want to show only relevant panels.
   *
   * Available built-in panel IDs:
   * - 'scene' - Scene Explorer
   * - 'stats' - Performance Stats
   * - 'materials' - Materials Inspector
   * - 'geometry' - Geometry Inspector
   * - 'textures' - Texture Viewer
   * - 'render-targets' - Render Targets Inspector
   * - 'webgpu' - WebGPU Inspector
   * - 'plugins' - Plugin Manager
   *
   * @example
   * ```typescript
   * createOverlay({
   *   probe,
   *   enabledPanels: ['scene', 'stats', 'render-targets']
   * });
   * ```
   */
  enabledPanels?: string[];
}

export interface OverlayPanelState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
  /**
   * Whether the panel is docked in the sidebar (true) or floating (false)
   */
  docked?: boolean;
}

type PanelState = OverlayPanelState;

export interface OverlayPanelContext {
  panelId: string;
  container: HTMLElement;
  panelElement: HTMLElement;
  probe: DevtoolProbe;
  overlay: ThreeLensOverlay;
  state: Readonly<PanelState>;
}

export interface OverlayPanelDefinition {
  id: string;
  title: string;
  icon: string;
  iconClass: string;
  defaultWidth: number;
  defaultHeight: number;
  render?: (context: OverlayPanelContext) => string | HTMLElement | void;
  onMount?: (context: OverlayPanelContext) => void;
  onDestroy?: (context: OverlayPanelContext) => void;
}

const SCENE_PANEL_WIDTH = 560; // Always show tree + inspector/global tools
const SCENE_PANEL_MAX_HEIGHT = 450; // Max auto-height before scrolling

const DEFAULT_PANELS: OverlayPanelDefinition[] = [
  {
    id: 'scene',
    title: 'Scene',
    icon: 'S',
    iconClass: 'scene',
    defaultWidth: SCENE_PANEL_WIDTH,
    defaultHeight: 0,
  }, // 0 = auto height
  {
    id: 'stats',
    title: 'Performance',
    icon: '⚡',
    iconClass: 'stats',
    defaultWidth: 320,
    defaultHeight: 400,
  },
  {
    id: 'materials',
    title: 'Materials',
    icon: '🎨',
    iconClass: 'materials',
    defaultWidth: 700,
    defaultHeight: 500,
  },
  {
    id: 'geometry',
    title: 'Geometry',
    icon: '📐',
    iconClass: 'inspector',
    defaultWidth: 750,
    defaultHeight: 500,
  },
  {
    id: 'textures',
    title: 'Textures',
    icon: '🖼️',
    iconClass: 'textures',
    defaultWidth: 800,
    defaultHeight: 520,
  },
  {
    id: 'render-targets',
    title: 'Render Targets',
    icon: '🎯',
    iconClass: 'render-targets',
    defaultWidth: 850,
    defaultHeight: 550,
  },
  {
    id: 'webgpu',
    title: 'WebGPU',
    icon: '🔷',
    iconClass: 'webgpu',
    defaultWidth: 700,
    defaultHeight: 500,
  },
  {
    id: 'plugins',
    title: 'Plugins',
    icon: '🔌',
    iconClass: 'plugin',
    defaultWidth: 420,
    defaultHeight: 480,
  },
];

/**
 * 3Lens Floating Panel Overlay
 */
export class ThreeLensOverlay {
  private root: HTMLDivElement;
  private probe: DevtoolProbe;
  private layoutMode: OverlayLayoutMode;
  private menuVisible = false;
  private sidebarCollapsed = false;
  private sidebarEventsAttached = false;
  private openPanels: Map<string, PanelState> = new Map();
  private dockedPanels: Set<string> = new Set(); // Panels currently docked in sidebar
  private selectedNodeId: string | null = null;
  private expandedNodes: Set<string> = new Set();
  private latestStats: FrameStats | null = null;
  private latestBenchmark: BenchmarkScore | null = null;
  private latestSnapshot: SceneSnapshot | null = null;
  private frameHistory: number[] = [];
  private gpuHistory: number[] = [];
  private fpsHistory: number[] = [];
  private topZIndex = 999997;
  private dragState: {
    panelId: string;
    startX: number;
    startY: number;
    startPanelX: number;
    startPanelY: number;
  } | null = null;
  private resizeState: {
    panelId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null = null;
  private lastStatsUpdate = 0;
  private statsUpdateInterval = 500; // Update stats UI every 500ms (2x per second)
  private statsTab:
    | 'overview'
    | 'memory'
    | 'rendering'
    | 'timeline'
    | 'resources' = 'overview';

  // Timeline/Frames state
  private timelineZoom = 1.0;
  private timelineOffset = 0;
  private timelineSelectedFrame: number | null = null;
  private timelineDragging = false;
  private timelineDragStartX = 0;
  private timelineDragStartOffset = 0;
  private timelineHoverIndex: number | null = null;
  private timelinePaused = false; // Pause auto-scrolling when hovering
  private isRecording = false;
  private recordedFrames: {
    cpu: number;
    gpu?: number;
    timestamp: number;
    drawCalls?: number;
    triangles?: number;
  }[] = [];
  private maxRecordedFrames = 1800; // 30 seconds at 60fps
  private frameBufferSize = 300; // Configurable buffer size (default 5 seconds at 60fps)
  private panelDefinitions: Map<string, OverlayPanelDefinition> = new Map();
  private panelContexts: Map<string, OverlayPanelContext> = new Map();

  // Plugin system
  private pluginPanelUnsubscribers: Map<string, () => void> = new Map();
  private pluginToolbarActions: Array<{
    key: string;
    pluginId: PluginId;
    action: ToolbarActionDefinition;
  }> = [];

  // Shared UI state for Materials, Geometry, Textures panels
  private uiState: UIState = createDefaultUIState();

  // Chart state
  private chartZoom = 1; // 1 = show all 60 frames, 2 = show 30, etc.
  private chartOffset = 0; // Pan offset (0 = showing latest frames)
  private chartHoverIndex: number | null = null;
  private chartDragging = false;
  private chartDragStartX = 0;
  private chartDragStartOffset = 0;
  private maxHistoryLength = 300; // Store more history for zoom (configurable via frameBufferSize)

  // Memory profiler state
  private memoryHistory: {
    timestamp: number;
    totalGpu: number;
    textures: number;
    geometry: number;
    renderTargets: number;
    jsHeap: number;
  }[] = [];
  private memoryHistoryMaxLength = 60; // 60 samples for memory chart
  private lastMemoryUpdate = 0;
  private memoryUpdateInterval = 1000; // Update memory history every 1 second

  // Advanced performance tracking
  private fpsHistogram: number[] = new Array(12).fill(0); // FPS buckets: 0-5, 5-10, 10-15, ... 50-55, 55+
  private drawCallHistory: number[] = [];
  private triangleHistory: number[] = [];
  private frameTimePercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  } = { p50: 0, p90: 0, p95: 0, p99: 0 };
  private performanceHistory: {
    timestamp: number;
    fps: number;
    frameTime: number;
    drawCalls: number;
    triangles: number;
  }[] = [];
  private performanceHistoryMaxLength = 120;

  // Session statistics
  private sessionStartTime = performance.now();
  private totalFramesRendered = 0;
  private droppedFrameCount = 0;
  private smoothFrameCount = 0;
  private peakFps = 0;
  private lowestFps = Infinity;
  private peakDrawCalls = 0;
  private peakTriangles = 0;
  private peakMemory = 0;
  private gpuCapabilities: {
    renderer: string;
    vendor: string;
    maxTextureSize: number;
    maxVertexUniforms: number;
    maxFragmentUniforms: number;
    maxTextureUnits: number;
    extensions: string[];
    antialias: boolean;
    powerPreference: string;
  } | null = null;

  // Virtual scrolling for large scene trees
  private virtualScrollThreshold = 100; // Use virtual scroll when tree has more than this many nodes
  private virtualScroller: VirtualScroller<SceneNode> | null = null;
  private virtualScrollContainer: HTMLElement | null = null;

  constructor(options: OverlayOptions) {
    this.probe = options.probe;
    this.layoutMode = options.layoutMode ?? 'fab';

    // Inject styles
    this.injectStyles();

    // Create root
    this.root = document.createElement('div');
    this.root.className = 'three-lens-root';
    document.body.appendChild(this.root);

    // Register panel definitions (built-in + custom, filtered by enabledPanels)
    this.initializePanelDefinitions(options.panels, options.enabledPanels);

    // Subscribe to probe events (throttled updates)
    this.probe.onFrameStats((stats) => {
      this.latestStats = stats;
      this.frameHistory.push(stats.cpuTimeMs);
      if (this.frameHistory.length > this.frameBufferSize)
        this.frameHistory.shift();

      // Track GPU history
      if (stats.gpuTimeMs !== undefined) {
        this.gpuHistory.push(stats.gpuTimeMs);
        if (this.gpuHistory.length > this.frameBufferSize)
          this.gpuHistory.shift();
      }

      // Record frames if recording is active
      if (
        this.isRecording &&
        this.recordedFrames.length < this.maxRecordedFrames
      ) {
        this.recordedFrames.push({
          cpu: stats.cpuTimeMs,
          gpu: stats.gpuTimeMs,
          timestamp: stats.timestamp,
          drawCalls: stats.drawCalls,
          triangles: stats.triangles,
        });
      }

      // Track FPS history
      const fps = stats.cpuTimeMs > 0 ? 1000 / stats.cpuTimeMs : 0;
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.frameBufferSize)
        this.fpsHistory.shift();

      // Update FPS histogram
      const fpsBucket = Math.min(11, Math.floor(fps / 5));
      this.fpsHistogram[fpsBucket]++;

      // Track draw calls and triangles history
      this.drawCallHistory.push(stats.drawCalls);
      if (this.drawCallHistory.length > this.frameBufferSize)
        this.drawCallHistory.shift();
      this.triangleHistory.push(stats.triangles);
      if (this.triangleHistory.length > this.frameBufferSize)
        this.triangleHistory.shift();

      // Update session statistics
      this.totalFramesRendered++;
      if (fps > this.peakFps) this.peakFps = fps;
      if (fps < this.lowestFps && fps > 0) this.lowestFps = fps;
      if (stats.drawCalls > this.peakDrawCalls)
        this.peakDrawCalls = stats.drawCalls;
      if (stats.triangles > this.peakTriangles)
        this.peakTriangles = stats.triangles;
      if (stats.memory && stats.memory.totalGpuMemory > this.peakMemory) {
        this.peakMemory = stats.memory.totalGpuMemory;
      }
      if (stats.cpuTimeMs > 16.67) {
        this.droppedFrameCount++;
      } else {
        this.smoothFrameCount++;
      }

      // Calculate frame time percentiles
      if (this.frameHistory.length >= 10) {
        const sorted = [...this.frameHistory].sort((a, b) => a - b);
        const len = sorted.length;
        this.frameTimePercentiles = {
          p50: sorted[Math.floor(len * 0.5)],
          p90: sorted[Math.floor(len * 0.9)],
          p95: sorted[Math.floor(len * 0.95)],
          p99: sorted[Math.floor(len * 0.99)],
        };
      }

      // Calculate benchmark score
      this.latestBenchmark = calculateBenchmarkScore(stats);

      const now = performance.now();

      // Track performance history (at a slower interval)
      if (now - this.lastMemoryUpdate >= this.memoryUpdateInterval) {
        this.lastMemoryUpdate = now;

        // Memory history
        if (stats.memory) {
          this.memoryHistory.push({
            timestamp: stats.timestamp,
            totalGpu: stats.memory.totalGpuMemory,
            textures: stats.memory.textureMemory,
            geometry: stats.memory.geometryMemory,
            renderTargets: stats.memory.renderTargetMemory,
            jsHeap: stats.memory.jsHeapSize ?? 0,
          });
          if (this.memoryHistory.length > this.memoryHistoryMaxLength) {
            this.memoryHistory.shift();
          }
        }

        // Performance history
        this.performanceHistory.push({
          timestamp: stats.timestamp,
          fps,
          frameTime: stats.cpuTimeMs,
          drawCalls: stats.drawCalls,
          triangles: stats.triangles,
        });
        if (this.performanceHistory.length > this.performanceHistoryMaxLength) {
          this.performanceHistory.shift();
        }
      }

      // Throttle UI updates to prevent flickering
      if (now - this.lastStatsUpdate >= this.statsUpdateInterval) {
        this.lastStatsUpdate = now;
        this.updateStatsPanel();
      }
    });

    this.probe.onSelectionChanged((_obj, meta) => {
      this.selectedNodeId = meta?.debugId ?? null;
      this.updateScenePanel();
      this.updateInspectorPanel();
    });

    // Subscribe to transform changes to update undo/redo button states
    this.probe.onTransformChanged(() => {
      this.updateScenePanel();
    });

    // Initial render
    this.render();

    // Global event listeners
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Setup plugin manager integration
    this.initializePluginIntegration();
  }

  // ═══════════════════════════════════════════════════════════════
  // PLUGIN INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialize the plugin system integration
   */
  private initializePluginIntegration(): void {
    const pluginManager = this.probe.getPluginManager();

    // Set toast callback
    pluginManager.setToastCallback((message, type) => {
      this.showToast(message, type);
    });

    // Set render request callback
    pluginManager.setRenderRequestCallback((pluginId) => {
      this.refreshPluginPanel(pluginId);
    });
  }

  /**
   * Register a plugin and create overlay panels for it
   */
  public registerAndActivatePlugin(plugin: DevtoolPlugin): Promise<void> {
    const pluginManager = this.probe.getPluginManager();

    // Register the plugin
    pluginManager.registerPlugin(plugin);

    // Create overlay panels for plugin panels
    if (plugin.panels) {
      for (const panel of plugin.panels) {
        this.registerPluginPanel(plugin.metadata.id, panel);
      }
    }

    // Sync toolbar actions
    this.syncPluginToolbarActions();

    // Activate the plugin
    return pluginManager.activatePlugin(plugin.metadata.id);
  }

  /**
   * Unregister a plugin and remove its panels
   */
  public async unregisterAndDeactivatePlugin(
    pluginId: PluginId
  ): Promise<void> {
    const pluginManager = this.probe.getPluginManager();

    // Deactivate first
    await pluginManager.deactivatePlugin(pluginId);

    // Remove overlay panels
    for (const [key, unsubscribe] of this.pluginPanelUnsubscribers) {
      if (key.startsWith(`${pluginId}:`)) {
        unsubscribe();
        this.pluginPanelUnsubscribers.delete(key);
      }
    }

    // Sync toolbar actions
    this.syncPluginToolbarActions();

    // Unregister
    await pluginManager.unregisterPlugin(pluginId);
  }

  /**
   * Register a plugin panel as an overlay panel
   */
  private registerPluginPanel(
    pluginId: PluginId,
    corePanel: CorePanelDefinition
  ): void {
    const panelKey = `${pluginId}:${corePanel.id}`;
    const pluginManager = this.probe.getPluginManager();

    const overlayPanel: OverlayPanelDefinition = {
      id: panelKey,
      title: corePanel.name,
      icon: corePanel.icon ?? '🔌',
      iconClass: 'plugin',
      defaultWidth: 400,
      defaultHeight: 300,
      render: (_context) => {
        // Render plugin panel content
        return pluginManager.renderPanel(panelKey);
      },
      onMount: (_context) => {
        // Mount the plugin panel
        pluginManager.mountPanel(panelKey, _context.container);
      },
      onDestroy: (_context) => {
        // Unmount the plugin panel
        pluginManager.unmountPanel(panelKey);
      },
    };

    const unsubscribe = this.registerPanel(overlayPanel);
    this.pluginPanelUnsubscribers.set(panelKey, unsubscribe);
  }

  /**
   * Sync toolbar actions from plugin manager
   */
  private syncPluginToolbarActions(): void {
    const pluginManager = this.probe.getPluginManager();
    this.pluginToolbarActions = pluginManager.getToolbarActions();

    // Re-render FAB and menu if visible
    if (this.menuVisible) {
      this.updateMenu();
    }
  }

  /**
   * Refresh a specific plugin panel
   */
  private refreshPluginPanel(pluginId: PluginId): void {
    for (const [panelKey] of this.pluginPanelUnsubscribers) {
      if (panelKey.startsWith(`${pluginId}:`)) {
        this.updatePanelContent(panelKey);
      }
    }
  }

  /**
   * Show a toast notification
   */
  public showToast(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `three-lens-toast three-lens-toast-${type}`;
    toast.innerHTML = `
      <span class="three-lens-toast-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="three-lens-toast-message">${message}</span>
    `;

    // Add to root
    let container = this.root.querySelector('.three-lens-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'three-lens-toast-container';
      this.root.appendChild(container);
    }
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Get the plugin manager for external access
   */
  public getPluginManager(): PluginManager {
    return this.probe.getPluginManager();
  }

  private injectStyles(): void {
    if (document.getElementById('three-lens-styles')) return;
    const style = document.createElement('style');
    style.id = 'three-lens-styles';
    // Combine overlay styles with shared panel styles and virtual scroll styles
    style.textContent =
      OVERLAY_STYLES + '\n' + getSharedStyles() + '\n' + VIRTUAL_SCROLL_STYLES;
    document.head.appendChild(style);
  }

  private render(): void {
    if (this.layoutMode === 'sidebar') {
      this.root.innerHTML = `
        ${this.renderSidebar()}
      `;
      this.attachSidebarEvents();
    } else {
      this.root.innerHTML = `
        ${this.renderFAB()}
        ${this.renderMenu()}
      `;
      this.attachFABEvents();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FAB & MENU
  // ═══════════════════════════════════════════════════════════════

  private renderFAB(): string {
    return `
      <button class="three-lens-fab ${this.menuVisible ? 'active' : ''}" id="three-lens-fab" title="3Lens DevTools">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Penrose Triangle - 3Lens Logo -->
          <path d="M50 10L85 70H70L50 35L30 70H15L50 10Z" fill="#EF6B6B"/>
          <path d="M15 70L50 10L35 10L10 55L25 55L15 70Z" fill="#60A5FA"/>
          <path d="M85 70L50 10L65 10L90 55L75 55L85 70Z" fill="#34D399"/>
          <path d="M15 70H35L50 45L65 70H85L50 10L15 70Z" fill="none" stroke="currentColor" stroke-width="2" stroke-opacity="0.2"/>
        </svg>
      </button>
    `;
  }

  private renderMenu(): string {
    return `
      <div class="three-lens-menu ${this.menuVisible ? 'visible' : ''}" id="three-lens-menu">
        <div class="three-lens-menu-header">Panels</div>
        ${this.renderMenuItems()}
      </div>
    `;
  }

  private renderMenuItems(): string {
    return this.getPanelDefinitions()
      .map(
        (panel) => `
          <button class="three-lens-menu-item ${this.openPanels.has(panel.id) ? 'active' : ''}" data-panel="${panel.id}">
            <span class="three-lens-menu-icon ${panel.iconClass}">${panel.icon}</span>
            <span>${panel.title}</span>
          </button>
        `
      )
      .join('');
  }

  private attachFABEvents(): void {
    const fab = document.getElementById('three-lens-fab');
    fab?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.menuVisible = !this.menuVisible;
      this.updateMenu();
    });

    // Menu items
    this.attachMenuItemEvents();

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (
        this.menuVisible &&
        !(e.target as HTMLElement).closest('.three-lens-menu, .three-lens-fab')
      ) {
        this.menuVisible = false;
        this.updateMenu();
      }
    });
  }

  private attachMenuItemEvents(container: ParentNode = document): void {
    container.querySelectorAll('.three-lens-menu-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const panelId = (e.currentTarget as HTMLElement).dataset.panel;
        if (panelId) {
          this.togglePanel(panelId);
          this.menuVisible = false;
          this.updateMenu();
        }
      });
    });
  }

  private updateMenu(): void {
    const fab = document.getElementById('three-lens-fab');
    const menu = document.getElementById('three-lens-menu');
    if (fab)
      fab.className = `three-lens-fab ${this.menuVisible ? 'active' : ''}`;
    if (menu)
      menu.className = `three-lens-menu ${this.menuVisible ? 'visible' : ''}`;

    // Update active states
    document.querySelectorAll('.three-lens-menu-item').forEach((item) => {
      const panelId = (item as HTMLElement).dataset.panel;
      if (panelId) {
        item.classList.toggle('active', this.openPanels.has(panelId));
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SIDEBAR LAYOUT
  // ═══════════════════════════════════════════════════════════════

  private renderSidebar(): string {
    return `
      <div class="three-lens-sidebar ${this.sidebarCollapsed ? 'collapsed' : ''}" id="three-lens-sidebar">
        <button class="three-lens-sidebar-toggle" id="three-lens-sidebar-toggle" title="${this.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="${this.sidebarCollapsed ? 'M6 4 L10 8 L6 12' : 'M10 4 L6 8 L10 12'}"/>
          </svg>
        </button>
        <div class="three-lens-sidebar-content">
          <div class="three-lens-sidebar-header">
            <div class="three-lens-sidebar-logo">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10L85 70H70L50 35L30 70H15L50 10Z" fill="#EF6B6B"/>
                <path d="M15 70L50 10L35 10L10 55L25 55L15 70Z" fill="#60A5FA"/>
                <path d="M85 70L50 10L65 10L90 55L75 55L85 70Z" fill="#34D399"/>
              </svg>
              ${this.sidebarCollapsed ? '' : '<span>3Lens</span>'}
            </div>
          </div>
          <div class="three-lens-sidebar-panels" id="three-lens-sidebar-panels">
            ${this.renderSidebarPanelItems()}
          </div>
        </div>
      </div>
    `;
  }

  private renderSidebarPanelItems(): string {
    return this.getPanelDefinitions()
      .map((panel) => {
        const isOpen = this.openPanels.has(panel.id);
        const isDocked = this.dockedPanels.has(panel.id);
        return `
          <div 
            class="three-lens-sidebar-panel-item ${isOpen ? 'active' : ''} ${isDocked ? 'docked' : ''}" 
            data-panel="${panel.id}"
            draggable="true"
          >
            <div class="three-lens-sidebar-panel-icon ${panel.iconClass}" title="${panel.title}">
              ${panel.icon}
            </div>
            ${this.sidebarCollapsed ? '' : `<span class="three-lens-sidebar-panel-title">${panel.title}</span>`}
            ${isDocked ? '<button class="three-lens-sidebar-panel-popout" data-action="popout" title="Pop out">↗</button>' : ''}
          </div>
        `;
      })
      .join('');
  }

  private attachSidebarEvents(): void {
    // Toggle button
    const toggle = document.getElementById('three-lens-sidebar-toggle');
    if (toggle && !toggle.hasAttribute('data-events-attached')) {
      toggle.setAttribute('data-events-attached', 'true');
      toggle.addEventListener('click', () => {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        this.updateSidebar();
      });
    }

    // Panel item clicks - reattach each time since items are re-rendered
    document
      .querySelectorAll('.three-lens-sidebar-panel-item')
      .forEach((item) => {
        if ((item as HTMLElement).hasAttribute('data-events-attached')) return;
        (item as HTMLElement).setAttribute('data-events-attached', 'true');

        const panelId = (item as HTMLElement).dataset.panel;
        if (!panelId) return;

        // Click to toggle panel
        item.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          // Don't toggle if clicking popout button
          if (target.closest('.three-lens-sidebar-panel-popout')) return;
          this.togglePanel(panelId);
        });

        // Popout button
        const popoutBtn = item.querySelector(
          '.three-lens-sidebar-panel-popout'
        );
        popoutBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.popOutPanel(panelId);
        });

        // Drag start
        item.addEventListener('dragstart', (e) => {
          const dragEvent = e as DragEvent;
          if (dragEvent.dataTransfer) {
            dragEvent.dataTransfer.effectAllowed = 'move';
            dragEvent.dataTransfer.setData('text/plain', panelId);
          }
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
        });
      });

    // Drop zone for docking panels - attach once
    const sidebarPanels = document.getElementById('three-lens-sidebar-panels');
    if (sidebarPanels && !sidebarPanels.hasAttribute('data-events-attached')) {
      sidebarPanels.setAttribute('data-events-attached', 'true');
      sidebarPanels.addEventListener('dragover', (e) => {
        e.preventDefault();
        const dragEvent = e as DragEvent;
        if (dragEvent.dataTransfer) {
          dragEvent.dataTransfer.dropEffect = 'move';
        }
        sidebarPanels.classList.add('drag-over');
      });

      sidebarPanels.addEventListener('dragleave', () => {
        sidebarPanels.classList.remove('drag-over');
      });

      sidebarPanels.addEventListener('drop', (e) => {
        e.preventDefault();
        sidebarPanels.classList.remove('drag-over');
        const dragEvent = e as DragEvent;
        const panelId = dragEvent.dataTransfer?.getData('text/plain');
        if (panelId) {
          this.dockPanel(panelId);
        }
      });
    }

    // Global drop zone for floating panels - attach once
    if (!this.sidebarEventsAttached) {
      this.sidebarEventsAttached = true;
      document.addEventListener('dragover', (e) => {
        const dragEvent = e as DragEvent;
        if (dragEvent.dataTransfer?.types.includes('text/plain')) {
          const panelId = dragEvent.dataTransfer.getData('text/plain');
          if (panelId && this.dockedPanels.has(panelId)) {
            // Only allow drop outside sidebar
            const sidebar = document.getElementById('three-lens-sidebar');
            if (sidebar && !sidebar.contains(e.target as Node)) {
              e.preventDefault();
              dragEvent.dataTransfer.dropEffect = 'move';
            }
          }
        }
      });

      document.addEventListener('drop', (e) => {
        const dragEvent = e as DragEvent;
        const panelId = dragEvent.dataTransfer?.getData('text/plain');
        if (panelId && this.dockedPanels.has(panelId)) {
          const sidebar = document.getElementById('three-lens-sidebar');
          if (sidebar && !sidebar.contains(e.target as Node)) {
            e.preventDefault();
            this.undockPanel(panelId, e.clientX, e.clientY);
          }
        }
      });
    }
  }

  private updateSidebar(): void {
    const sidebar = document.getElementById('three-lens-sidebar');
    const toggle = document.getElementById('three-lens-sidebar-toggle');
    if (sidebar) {
      sidebar.className = `three-lens-sidebar ${this.sidebarCollapsed ? 'collapsed' : ''}`;
    }
    if (toggle) {
      toggle.title = this.sidebarCollapsed
        ? 'Expand sidebar'
        : 'Collapse sidebar';
    }
    // Re-render panel items to update collapsed state
    const panelsContainer = document.getElementById(
      'three-lens-sidebar-panels'
    );
    if (panelsContainer) {
      panelsContainer.innerHTML = this.renderSidebarPanelItems();
      this.attachSidebarEvents();
    }
  }

  private dockPanel(panelId: string): void {
    if (!this.openPanels.has(panelId)) {
      this.openPanel(panelId);
    }
    this.dockedPanels.add(panelId);
    const state = this.openPanels.get(panelId);
    if (state) {
      state.docked = true;
    }
    // Hide floating panel if it exists
    const panelEl = document.getElementById(`three-lens-panel-${panelId}`);
    if (panelEl) {
      panelEl.style.display = 'none';
    }
    this.updateSidebar();
  }

  private undockPanel(panelId: string, x: number, y: number): void {
    this.dockedPanels.delete(panelId);
    const state = this.openPanels.get(panelId);
    if (state) {
      state.docked = false;
      state.x = x - 100; // Offset from cursor
      state.y = y - 50;
    }
    // Show floating panel
    const panelEl = document.getElementById(`three-lens-panel-${panelId}`);
    if (panelEl) {
      panelEl.style.display = '';
      panelEl.style.left = `${state?.x ?? 100}px`;
      panelEl.style.top = `${state?.y ?? 100}px`;
    }
    this.updateSidebar();
  }

  private popOutPanel(panelId: string): void {
    this.undockPanel(panelId, window.innerWidth / 2, window.innerHeight / 2);
  }

  private initializePanelDefinitions(
    customPanels?: OverlayPanelDefinition[],
    enabledPanels?: string[]
  ): void {
    // Filter built-in panels if enabledPanels is specified
    const builtInPanels = enabledPanels
      ? DEFAULT_PANELS.filter((panel) => enabledPanels.includes(panel.id))
      : DEFAULT_PANELS;

    [...builtInPanels, ...(customPanels ?? [])].forEach((panel) =>
      this.registerPanelDefinition(panel)
    );
  }

  private registerPanelDefinition(panel: OverlayPanelDefinition): void {
    if (this.panelDefinitions.has(panel.id)) return;
    this.panelDefinitions.set(panel.id, panel);
  }

  /**
   * Register a new panel at runtime.
   * Returns an unregister function to remove the panel and close it if open.
   */
  public registerPanel(panel: OverlayPanelDefinition): () => void {
    this.registerPanelDefinition(panel);
    this.refreshMenuItems();
    return () => this.unregisterPanel(panel.id);
  }

  public unregisterPanel(panelId: string): void {
    if (this.openPanels.has(panelId)) {
      this.closePanel(panelId);
    } else {
      this.updateMenu();
    }
    this.panelDefinitions.delete(panelId);
    this.refreshMenuItems();
  }

  private getPanelDefinitions(): OverlayPanelDefinition[] {
    return Array.from(this.panelDefinitions.values());
  }

  private refreshMenuItems(): void {
    if (this.layoutMode === 'sidebar') {
      const panelsContainer = document.getElementById(
        'three-lens-sidebar-panels'
      );
      if (panelsContainer) {
        panelsContainer.innerHTML = this.renderSidebarPanelItems();
        this.attachSidebarEvents();
      }
    } else {
      const menu = document.getElementById('three-lens-menu');
      if (!menu) return;
      menu.innerHTML = `
        <div class="three-lens-menu-header">Panels</div>
        ${this.renderMenuItems()}
      `;
      this.attachMenuItemEvents(menu);
      this.updateMenu();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PANEL MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  private togglePanel(panelId: string): void {
    if (this.openPanels.has(panelId)) {
      // If docked, pop it out to show as floating panel
      if (this.dockedPanels.has(panelId)) {
        this.popOutPanel(panelId);
      } else {
        // If floating, close it
        this.closePanel(panelId);
      }
    } else {
      // Open panel (will be docked by default in sidebar mode)
      this.openPanel(panelId);
    }
  }

  private openPanel(panelId: string): void {
    const config = this.panelDefinitions.get(panelId);
    if (!config) return;

    // In sidebar mode, dock panels by default unless they're already floating
    const shouldDock =
      this.layoutMode === 'sidebar' && !this.openPanels.has(panelId);

    // Calculate position (cascade)
    const offset = this.openPanels.size * 30;

    // For scene panel, check if there's a selection to determine initial width
    const initialWidth = config.defaultWidth;

    const state: PanelState = {
      id: panelId,
      x: 100 + offset,
      y: 100 + offset,
      width: initialWidth,
      height: config.defaultHeight,
      minimized: false,
      zIndex: ++this.topZIndex,
      docked: shouldDock,
    };

    this.openPanels.set(panelId, state);

    if (shouldDock) {
      this.dockedPanels.add(panelId);
    }

    // Always create panel element (needed for both docked and floating)
    this.createPanelElement(config, state);

    // Hide panel if docked
    if (shouldDock) {
      const panelEl = document.getElementById(`three-lens-panel-${panelId}`);
      if (panelEl) {
        panelEl.style.display = 'none';
      }
    }

    // For scene panel, ensure size is correct after mounting (handles edge cases)
    if (panelId === 'scene') {
      requestAnimationFrame(() => {
        this.updateScenePanelSize();
      });
    }

    if (this.layoutMode === 'sidebar') {
      this.updateSidebar();
    } else {
      this.updateMenu();
    }
  }

  private closePanel(panelId: string): void {
    this.destroyPanel(panelId);
    this.dockedPanels.delete(panelId);
    if (this.layoutMode === 'sidebar') {
      this.updateSidebar();
    } else {
      this.updateMenu();
    }
  }

  private createPanelElement(
    config: OverlayPanelDefinition,
    state: PanelState
  ): void {
    const panel = document.createElement('div');
    panel.id = `three-lens-panel-${config.id}`;
    panel.className = 'three-lens-panel';

    // Scene panel uses auto height with max-height constraint
    const isAutoHeight = config.id === 'scene';
    const heightStyle = isAutoHeight
      ? `max-height: ${SCENE_PANEL_MAX_HEIGHT}px`
      : `height: ${state.height}px`;

    panel.style.cssText = `
      left: ${state.x}px;
      top: ${state.y}px;
      width: ${state.width}px;
      ${heightStyle};
      z-index: ${state.zIndex};
    `;

    const hasSearch = ['materials', 'geometry', 'textures'].includes(config.id);
    const searchPlaceholder =
      config.id === 'materials'
        ? 'Search materials...'
        : config.id === 'geometry'
          ? 'Search geometry...'
          : 'Search textures...';

    panel.innerHTML = `
      <div class="three-lens-panel-header" data-panel="${config.id}">
        <span class="three-lens-panel-icon ${config.iconClass}">${config.icon}</span>
        <span class="three-lens-panel-title">${config.title}</span>
        ${
          hasSearch
            ? `
          <div class="three-lens-header-search">
            <input 
              type="text" 
              class="header-search-input" 
              data-panel="${config.id}"
              placeholder="${searchPlaceholder}" 
            />
          </div>
        `
            : ''
        }
        <div class="three-lens-panel-controls">
          <button class="three-lens-panel-btn minimize" data-action="minimize" title="Minimize">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="2" y1="6" x2="10" y2="6"/>
            </svg>
          </button>
          <button class="three-lens-panel-btn close" data-action="close" title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="2" y1="2" x2="10" y2="10"/>
              <line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="three-lens-panel-content" id="three-lens-content-${config.id}">
        ${this.getInitialPanelMarkup(config.id)}
      </div>
      <div class="three-lens-panel-resize" data-panel="${config.id}"></div>
    `;

    this.root.appendChild(panel);
    this.mountPanel(config.id, panel);
    this.attachPanelEvents(panel, config.id);
  }

  private getInitialPanelMarkup(panelId: string): string {
    switch (panelId) {
      case 'scene':
        return this.renderSceneContent();
      case 'stats':
        return this.renderStatsContent();
      case 'materials':
        return this.renderMaterialsContent();
      case 'geometry':
        return this.renderGeometryContent();
      case 'textures':
        return this.renderTexturesContent();
      case 'render-targets':
        return this.renderRenderTargetsContent();
      case 'webgpu':
        return this.renderWebGPUContent();
      case 'plugins':
        return this.renderPluginsContent();
      default:
        return '<div class="three-lens-inspector-empty">Panel content</div>';
    }
  }

  private buildSharedPanelContext(): PanelContext {
    return {
      probe: this.probe,
      snapshot: this.latestSnapshot,
      stats: this.latestStats,
      benchmark: this.latestBenchmark,
      sendCommand: (cmd: PanelCommand) => this.handlePanelCommand(cmd),
      requestSnapshot: () => this.refreshSnapshot(),
    };
  }

  private handlePanelCommand(command: PanelCommand): void {
    switch (command.type) {
      case 'select-object':
        if (command.debugId) {
          this.probe.selectByDebugId(command.debugId);
        } else {
          this.probe.selectObject(null);
        }
        break;
      case 'update-material-property':
        // Find the material and update it
        this.probe.updateMaterialProperty(
          command.materialUuid,
          command.property,
          command.value
        );
        // Refresh the snapshot after the update
        this.refreshSnapshot();
        break;
      case 'geometry-visualization':
        // Toggle visualization - for now just track in UI state
        // The actual visualization helpers would require THREE reference
        break;
    }
  }

  private refreshSnapshot(): void {
    this.latestSnapshot = this.probe.takeSnapshot();
  }

  private updateUIState(updates: Partial<UIState>): void {
    this.uiState = { ...this.uiState, ...updates };
  }

  private renderMaterialsContent(): string {
    this.refreshSnapshot();
    return renderMaterialsPanel(this.buildSharedPanelContext(), this.uiState);
  }

  private renderGeometryContent(): string {
    this.refreshSnapshot();
    return renderGeometryPanel(this.buildSharedPanelContext(), this.uiState);
  }

  private renderTexturesContent(): string {
    this.refreshSnapshot();
    return renderTexturesPanel(this.buildSharedPanelContext(), this.uiState);
  }

  private renderRenderTargetsContent(): string {
    this.refreshSnapshot();
    return renderRenderTargetsPanel(
      this.buildSharedPanelContext(),
      this.uiState
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PLUGINS PANEL
  // ═══════════════════════════════════════════════════════════════

  private selectedPluginId: string | null = null;

  private renderPluginsContent(): string {
    const pluginManager = this.probe.getPluginManager();
    const plugins = pluginManager.getPlugins();

    return `
      <div class="three-lens-plugins-panel">
        <div class="three-lens-plugins-header">
          <span class="three-lens-plugins-count">${plugins.length} plugin${plugins.length !== 1 ? 's' : ''}</span>
          <button class="three-lens-plugins-btn" data-action="load-plugin" title="Load Plugin">
            <span>+ Load Plugin</span>
          </button>
        </div>
        
        <div class="three-lens-plugins-list">
          ${
            plugins.length === 0
              ? '<div class="three-lens-plugins-empty">No plugins installed</div>'
              : plugins.map((p) => this.renderPluginListItem(p)).join('')
          }
        </div>
        
        ${this.selectedPluginId ? this.renderPluginSettings(this.selectedPluginId) : this.renderPluginLoadForm()}
      </div>
    `;
  }

  private renderPluginListItem(plugin: {
    id: string;
    metadata: {
      id: string;
      name: string;
      version: string;
      icon?: string;
      description?: string;
    };
    state: string;
  }): string {
    const isSelected = this.selectedPluginId === plugin.id;
    const isActive = plugin.state === 'activated';
    const isError = plugin.state === 'error';

    return `
      <div class="three-lens-plugin-item ${isSelected ? 'selected' : ''} ${isError ? 'error' : ''}" data-plugin-id="${plugin.id}">
        <div class="three-lens-plugin-icon">${plugin.metadata.icon ?? '🔌'}</div>
        <div class="three-lens-plugin-info">
          <div class="three-lens-plugin-name">${plugin.metadata.name}</div>
          <div class="three-lens-plugin-version">v${plugin.metadata.version}</div>
        </div>
        <div class="three-lens-plugin-status ${isActive ? 'active' : isError ? 'error' : 'inactive'}">
          ${isActive ? '●' : isError ? '!' : '○'}
        </div>
        <div class="three-lens-plugin-actions">
          ${
            isActive
              ? `<button class="three-lens-plugin-action-btn" data-action="deactivate" data-plugin-id="${plugin.id}" title="Deactivate">⏸</button>`
              : `<button class="three-lens-plugin-action-btn" data-action="activate" data-plugin-id="${plugin.id}" title="Activate">▶</button>`
          }
          <button class="three-lens-plugin-action-btn" data-action="unregister" data-plugin-id="${plugin.id}" title="Unregister">✕</button>
        </div>
      </div>
    `;
  }

  private renderPluginLoadForm(): string {
    return `
      <div class="three-lens-plugin-load-form">
        <div class="three-lens-section-header">Load Plugin</div>
        <div class="three-lens-plugin-form-group">
          <label class="three-lens-plugin-label">Source</label>
          <select class="three-lens-plugin-select" id="plugin-load-source">
            <option value="npm">npm Package</option>
            <option value="url">URL</option>
          </select>
        </div>
        <div class="three-lens-plugin-form-group">
          <label class="three-lens-plugin-label">Package / URL</label>
          <input type="text" class="three-lens-plugin-input" id="plugin-load-input" placeholder="@3lens/plugin-example" />
        </div>
        <div class="three-lens-plugin-form-group npm-only">
          <label class="three-lens-plugin-label">Version</label>
          <input type="text" class="three-lens-plugin-input" id="plugin-load-version" placeholder="latest" value="latest" />
        </div>
        <button class="three-lens-plugin-submit-btn" data-action="submit-load">Load Plugin</button>
        <div class="three-lens-plugin-load-status" id="plugin-load-status"></div>
      </div>
    `;
  }

  private renderPluginSettings(pluginId: string): string {
    const pluginManager = this.probe.getPluginManager();
    const registered = pluginManager.getPlugin(pluginId);

    if (!registered) {
      return '<div class="three-lens-plugin-settings">Plugin not found</div>';
    }

    const { plugin, state, settings } = registered;
    const settingsSchema = plugin.settings;

    return `
      <div class="three-lens-plugin-settings">
        <div class="three-lens-plugin-settings-header">
          <button class="three-lens-plugin-back-btn" data-action="back-to-list">← Back</button>
          <span class="three-lens-plugin-settings-title">${plugin.metadata.name}</span>
        </div>
        
        <div class="three-lens-plugin-details">
          ${plugin.metadata.description ? `<div class="three-lens-plugin-description">${plugin.metadata.description}</div>` : ''}
          <div class="three-lens-plugin-meta">
            <span>Version: ${plugin.metadata.version}</span>
            ${plugin.metadata.author ? `<span>Author: ${plugin.metadata.author}</span>` : ''}
            <span>Status: ${state}</span>
          </div>
        </div>
        
        ${
          settingsSchema && settingsSchema.fields.length > 0
            ? `
          <div class="three-lens-section-header">Settings</div>
          <div class="three-lens-plugin-settings-fields">
            ${settingsSchema.fields.map((field) => this.renderPluginSettingField(pluginId, field, settings[field.key])).join('')}
          </div>
        `
            : '<div class="three-lens-plugin-no-settings">This plugin has no configurable settings.</div>'
        }
        
        <div class="three-lens-plugin-settings-actions">
          ${
            state === 'activated'
              ? `<button class="three-lens-plugin-btn danger" data-action="deactivate" data-plugin-id="${pluginId}">Deactivate</button>`
              : `<button class="three-lens-plugin-btn primary" data-action="activate" data-plugin-id="${pluginId}">Activate</button>`
          }
          <button class="three-lens-plugin-btn danger" data-action="unregister" data-plugin-id="${pluginId}">Unregister</button>
        </div>
      </div>
    `;
  }

  private renderPluginSettingField(
    pluginId: string,
    field: {
      key: string;
      label: string;
      type: string;
      description?: string;
      options?: Array<{ value: unknown; label: string }>;
      min?: number;
      max?: number;
      step?: number;
    },
    value: unknown
  ): string {
    const inputId = `plugin-setting-${pluginId}-${field.key}`;

    let inputHtml = '';
    switch (field.type) {
      case 'boolean':
        inputHtml = `
          <label class="three-lens-toggle">
            <input type="checkbox" id="${inputId}" data-plugin-id="${pluginId}" data-setting-key="${field.key}" ${value ? 'checked' : ''} />
            <span class="three-lens-toggle-slider"></span>
          </label>
        `;
        break;
      case 'number':
        inputHtml = `
          <input type="number" class="three-lens-plugin-input" id="${inputId}" 
            data-plugin-id="${pluginId}" data-setting-key="${field.key}"
            value="${value ?? ''}" 
            ${field.min !== undefined ? `min="${field.min}"` : ''}
            ${field.max !== undefined ? `max="${field.max}"` : ''}
            ${field.step !== undefined ? `step="${field.step}"` : ''}
          />
        `;
        break;
      case 'select':
        inputHtml = `
          <select class="three-lens-plugin-select" id="${inputId}" data-plugin-id="${pluginId}" data-setting-key="${field.key}">
            ${(field.options ?? [])
              .map(
                (opt) => `
              <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>
            `
              )
              .join('')}
          </select>
        `;
        break;
      case 'color':
        inputHtml = `
          <input type="color" class="three-lens-plugin-color" id="${inputId}" 
            data-plugin-id="${pluginId}" data-setting-key="${field.key}"
            value="${value ?? '#000000'}" 
          />
        `;
        break;
      case 'string':
      default:
        inputHtml = `
          <input type="text" class="three-lens-plugin-input" id="${inputId}" 
            data-plugin-id="${pluginId}" data-setting-key="${field.key}"
            value="${value ?? ''}" 
          />
        `;
        break;
    }

    return `
      <div class="three-lens-plugin-setting-field">
        <div class="three-lens-plugin-setting-row">
          <label class="three-lens-plugin-setting-label" for="${inputId}">${field.label}</label>
          ${inputHtml}
        </div>
        ${field.description ? `<div class="three-lens-plugin-setting-desc">${field.description}</div>` : ''}
      </div>
    `;
  }

  private attachPluginsPanelEvents(container: HTMLElement): void {
    // Plugin item selection
    container.querySelectorAll('.three-lens-plugin-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        // Don't select if clicking action buttons
        if ((e.target as HTMLElement).closest('.three-lens-plugin-action-btn'))
          return;
        const pluginId = (item as HTMLElement).dataset.pluginId;
        if (pluginId) {
          this.selectedPluginId = pluginId;
          this.updatePluginsPanel();
        }
      });
    });

    // Action buttons in list
    container
      .querySelectorAll('.three-lens-plugin-action-btn')
      .forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const action = (btn as HTMLElement).dataset.action;
          const pluginId = (btn as HTMLElement).dataset.pluginId;
          if (!pluginId) return;

          await this.handlePluginAction(action!, pluginId);
        });
      });

    // Header load plugin button
    container
      .querySelector('[data-action="load-plugin"]')
      ?.addEventListener('click', () => {
        this.selectedPluginId = null;
        this.updatePluginsPanel();
      });

    // Back to list button
    container
      .querySelector('[data-action="back-to-list"]')
      ?.addEventListener('click', () => {
        this.selectedPluginId = null;
        this.updatePluginsPanel();
      });

    // Settings actions
    container
      .querySelectorAll('.three-lens-plugin-btn[data-action]')
      .forEach((btn) => {
        btn.addEventListener('click', async () => {
          const action = (btn as HTMLElement).dataset.action;
          const pluginId = (btn as HTMLElement).dataset.pluginId;
          if (!pluginId) return;

          await this.handlePluginAction(action!, pluginId);
        });
      });

    // Setting field changes
    container.querySelectorAll('[data-setting-key]').forEach((input) => {
      input.addEventListener('change', () => {
        const pluginId = (input as HTMLElement).dataset.pluginId!;
        const key = (input as HTMLElement).dataset.settingKey!;
        let value: unknown;

        if ((input as HTMLInputElement).type === 'checkbox') {
          value = (input as HTMLInputElement).checked;
        } else if ((input as HTMLInputElement).type === 'number') {
          value = parseFloat((input as HTMLInputElement).value);
        } else {
          value = (input as HTMLInputElement).value;
        }

        this.probe
          .getPluginManager()
          .updatePluginSettings(pluginId, { [key]: value });
      });
    });

    // Load form source change
    const sourceSelect = container.querySelector(
      '#plugin-load-source'
    ) as HTMLSelectElement | null;
    sourceSelect?.addEventListener('change', () => {
      const npmOnlyFields = container.querySelectorAll('.npm-only');
      const inputField = container.querySelector(
        '#plugin-load-input'
      ) as HTMLInputElement | null;

      if (sourceSelect.value === 'npm') {
        npmOnlyFields.forEach((f) => ((f as HTMLElement).style.display = ''));
        if (inputField) inputField.placeholder = '@3lens/plugin-example';
      } else {
        npmOnlyFields.forEach(
          (f) => ((f as HTMLElement).style.display = 'none')
        );
        if (inputField)
          inputField.placeholder = 'https://example.com/plugin.js';
      }
    });

    // Submit load form
    container
      .querySelector('[data-action="submit-load"]')
      ?.addEventListener('click', async () => {
        const source =
          (container.querySelector('#plugin-load-source') as HTMLSelectElement)
            ?.value ?? 'npm';
        const input = (
          container.querySelector('#plugin-load-input') as HTMLInputElement
        )?.value?.trim();
        const version =
          (
            container.querySelector('#plugin-load-version') as HTMLInputElement
          )?.value?.trim() || 'latest';
        const statusEl = container.querySelector(
          '#plugin-load-status'
        ) as HTMLElement | null;

        if (!input) {
          if (statusEl)
            statusEl.innerHTML =
              '<span class="error">Please enter a package name or URL</span>';
          return;
        }

        if (statusEl)
          statusEl.innerHTML = '<span class="loading">Loading plugin...</span>';

        try {
          let result;
          if (source === 'npm') {
            result = await this.probe.loadPlugin(input, version);
          } else {
            result = await this.probe.loadPluginFromUrl(input);
          }

          if (result.success) {
            if (statusEl)
              statusEl.innerHTML = `<span class="success">✓ Loaded ${result.plugin?.metadata.name}</span>`;
            setTimeout(() => this.updatePluginsPanel(), 1000);
          } else {
            if (statusEl)
              statusEl.innerHTML = `<span class="error">✕ ${result.error?.message ?? 'Failed to load'}</span>`;
          }
        } catch (error) {
          if (statusEl)
            statusEl.innerHTML = `<span class="error">✕ ${error instanceof Error ? error.message : 'Unknown error'}</span>`;
        }
      });
  }

  private async handlePluginAction(
    action: string,
    pluginId: string
  ): Promise<void> {
    const pluginManager = this.probe.getPluginManager();

    switch (action) {
      case 'activate':
        await pluginManager.activatePlugin(pluginId);
        break;
      case 'deactivate':
        await pluginManager.deactivatePlugin(pluginId);
        break;
      case 'unregister':
        if (this.selectedPluginId === pluginId) {
          this.selectedPluginId = null;
        }
        await pluginManager.unregisterPlugin(pluginId);
        break;
    }

    this.updatePluginsPanel();
  }

  private updatePluginsPanel(): void {
    const content = document.getElementById('three-lens-content-plugins');
    if (!content) return;

    content.innerHTML = this.renderPluginsContent();
    this.attachPluginsPanelEvents(content);
  }

  // ═══════════════════════════════════════════════════════════════
  // WEBGPU PANEL
  // ═══════════════════════════════════════════════════════════════

  private webgpuTab:
    | 'pipelines'
    | 'bindgroups'
    | 'shaders'
    | 'timing'
    | 'capabilities' = 'pipelines';
  private selectedPipelineId: string | null = null;
  private selectedBindGroupId: string | null = null;

  private renderWebGPUContent(): string {
    // Check if WebGPU is being used
    if (!this.probe.isWebGPU()) {
      return `
        <div class="webgpu-panel">
          <div class="webgpu-not-available">
            <div class="webgpu-not-available-icon">🔷</div>
            <div class="webgpu-not-available-title">WebGPU Not Active</div>
            <div class="webgpu-not-available-desc">
              The current renderer is using WebGL. This panel provides debugging tools 
              specifically for Three.js WebGPURenderer.
            </div>
            <div class="webgpu-not-available-hint">
              To use WebGPU, initialize your app with <code>WebGPURenderer</code> from 
              <code>three/webgpu</code>.
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="webgpu-panel">
        <div class="webgpu-tabs">
          <button class="webgpu-tab ${this.webgpuTab === 'pipelines' ? 'active' : ''}" data-tab="pipelines">Pipelines</button>
          <button class="webgpu-tab ${this.webgpuTab === 'bindgroups' ? 'active' : ''}" data-tab="bindgroups">Bind Groups</button>
          <button class="webgpu-tab ${this.webgpuTab === 'shaders' ? 'active' : ''}" data-tab="shaders">Shaders</button>
          <button class="webgpu-tab ${this.webgpuTab === 'timing' ? 'active' : ''}" data-tab="timing">GPU Timing</button>
          <button class="webgpu-tab ${this.webgpuTab === 'capabilities' ? 'active' : ''}" data-tab="capabilities">Capabilities</button>
        </div>
        <div class="webgpu-tab-content">
          ${this.renderWebGPUTabContent()}
        </div>
      </div>
    `;
  }

  private renderWebGPUTabContent(): string {
    switch (this.webgpuTab) {
      case 'pipelines':
        return this.renderWebGPUPipelinesTab();
      case 'bindgroups':
        return this.renderWebGPUBindGroupsTab();
      case 'shaders':
        return this.renderWebGPUShadersTab();
      case 'timing':
        return this.renderWebGPUTimingTab();
      case 'capabilities':
        return this.renderWebGPUCapabilitiesTab();
      default:
        return '';
    }
  }

  private renderWebGPUPipelinesTab(): string {
    const adapter = this.probe.getRendererAdapter();
    const pipelines = adapter?.getPipelines?.() ?? [];

    if (pipelines.length === 0) {
      return `
        <div class="webgpu-empty">
          <p>No pipelines detected yet.</p>
          <p class="webgpu-hint">Pipelines are created when materials are compiled for rendering.</p>
        </div>
      `;
    }

    const renderPipelines = pipelines.filter((p) => p.type === 'render');
    const computePipelines = pipelines.filter((p) => p.type === 'compute');

    return `
      <div class="webgpu-pipelines">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>Render Pipelines</span>
            <span class="webgpu-badge">${renderPipelines.length}</span>
          </div>
          <div class="webgpu-pipeline-list">
            ${
              renderPipelines.length === 0
                ? '<div class="webgpu-empty-small">No render pipelines</div>'
                : renderPipelines
                    .map((p) => this.renderPipelineItem(p))
                    .join('')
            }
          </div>
        </div>
        
        ${
          computePipelines.length > 0
            ? `
          <div class="webgpu-section">
            <div class="webgpu-section-header">
              <span>Compute Pipelines</span>
              <span class="webgpu-badge">${computePipelines.length}</span>
            </div>
            <div class="webgpu-pipeline-list">
              ${computePipelines.map((p) => this.renderPipelineItem(p)).join('')}
            </div>
          </div>
        `
            : ''
        }
        
        ${this.selectedPipelineId ? this.renderPipelineDetails(this.selectedPipelineId, pipelines) : ''}
      </div>
    `;
  }

  private renderPipelineItem(pipeline: {
    id: string;
    type: string;
    label?: string;
    usedByMaterials: string[];
    usageCount?: number;
  }): string {
    const isSelected = this.selectedPipelineId === pipeline.id;
    const icon = pipeline.type === 'render' ? '🎨' : '⚡';
    const label = pipeline.label ?? pipeline.id;

    return `
      <div class="webgpu-pipeline-item ${isSelected ? 'selected' : ''}" data-pipeline-id="${pipeline.id}">
        <span class="webgpu-pipeline-icon">${icon}</span>
        <span class="webgpu-pipeline-name">${this.escapeHtml(label)}</span>
        <span class="webgpu-pipeline-type">${pipeline.type}</span>
        ${pipeline.usageCount ? `<span class="webgpu-pipeline-usage">${pipeline.usageCount} uses</span>` : ''}
      </div>
    `;
  }

  private renderPipelineDetails(
    pipelineId: string,
    pipelines: Array<{
      id: string;
      type: string;
      label?: string;
      vertexStage?: string;
      fragmentStage?: string;
      computeStage?: string;
      usedByMaterials: string[];
    }>
  ): string {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    if (!pipeline) return '';

    return `
      <div class="webgpu-pipeline-details">
        <div class="webgpu-details-header">
          <span class="webgpu-details-title">${pipeline.type === 'render' ? '🎨' : '⚡'} ${this.escapeHtml(pipeline.label ?? pipeline.id)}</span>
          <button class="webgpu-close-btn" data-action="close-pipeline-details">×</button>
        </div>
        
        <div class="webgpu-details-content">
          <div class="webgpu-detail-row">
            <span class="webgpu-detail-label">Type</span>
            <span class="webgpu-detail-value">${pipeline.type}</span>
          </div>
          <div class="webgpu-detail-row">
            <span class="webgpu-detail-label">ID</span>
            <span class="webgpu-detail-value mono">${pipeline.id}</span>
          </div>
          ${
            pipeline.usedByMaterials.length > 0
              ? `
            <div class="webgpu-detail-row">
              <span class="webgpu-detail-label">Materials</span>
              <span class="webgpu-detail-value">${pipeline.usedByMaterials.length} material(s)</span>
            </div>
          `
              : ''
          }
          
          ${
            pipeline.vertexStage
              ? `
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Vertex Stage</div>
              <div class="webgpu-shader-stage-entry">${pipeline.vertexStage}</div>
            </div>
          `
              : ''
          }
          
          ${
            pipeline.fragmentStage
              ? `
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Fragment Stage</div>
              <div class="webgpu-shader-stage-entry">${pipeline.fragmentStage}</div>
            </div>
          `
              : ''
          }
          
          ${
            pipeline.computeStage
              ? `
            <div class="webgpu-shader-stage">
              <div class="webgpu-shader-stage-header">Compute Stage</div>
              <div class="webgpu-shader-stage-entry">${pipeline.computeStage}</div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  private renderWebGPUBindGroupsTab(): string {
    // Bind groups would need deeper tracking - show placeholder for now
    return `
      <div class="webgpu-bindgroups">
        <div class="webgpu-info">
          <div class="webgpu-info-icon">📦</div>
          <div class="webgpu-info-title">Bind Groups</div>
          <div class="webgpu-info-desc">
            Bind groups contain resources (buffers, textures, samplers) that are bound to shaders.
            Deep bind group tracking requires additional instrumentation.
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Common Bind Group Types</div>
          <div class="webgpu-bindgroup-types">
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">📐</span>
              <span class="webgpu-bindgroup-type-name">Camera Uniforms</span>
              <span class="webgpu-bindgroup-type-desc">View, projection, camera position</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">🎨</span>
              <span class="webgpu-bindgroup-type-name">Material Properties</span>
              <span class="webgpu-bindgroup-type-desc">Color, roughness, metalness, textures</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">💡</span>
              <span class="webgpu-bindgroup-type-name">Lighting Data</span>
              <span class="webgpu-bindgroup-type-desc">Light positions, colors, shadow maps</span>
            </div>
            <div class="webgpu-bindgroup-type">
              <span class="webgpu-bindgroup-type-icon">🦴</span>
              <span class="webgpu-bindgroup-type-name">Skeleton/Morph</span>
              <span class="webgpu-bindgroup-type-desc">Bone matrices, morph targets</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderWebGPUShadersTab(): string {
    const adapter = this.probe.getRendererAdapter();
    const pipelines = adapter?.getPipelines?.() ?? [];

    // Group by shader stage availability
    const withShaders = pipelines.filter(
      (p) => p.vertexStage || p.fragmentStage || p.computeStage
    );

    return `
      <div class="webgpu-shaders">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>WGSL Shaders</span>
            <span class="webgpu-badge">${withShaders.length}</span>
          </div>
          
          ${
            withShaders.length === 0
              ? `
            <div class="webgpu-empty">
              <p>No shader sources available.</p>
              <p class="webgpu-hint">Shader source inspection requires additional instrumentation of the WebGPU backend.</p>
            </div>
          `
              : `
            <div class="webgpu-shader-list">
              ${withShaders
                .map(
                  (p) => `
                <div class="webgpu-shader-item" data-pipeline-id="${p.id}">
                  <span class="webgpu-shader-icon">${p.type === 'compute' ? '⚡' : '🎨'}</span>
                  <span class="webgpu-shader-name">${this.escapeHtml(p.label ?? p.id)}</span>
                  <span class="webgpu-shader-stages">
                    ${p.vertexStage ? '<span class="webgpu-stage-badge vs">VS</span>' : ''}
                    ${p.fragmentStage ? '<span class="webgpu-stage-badge fs">FS</span>' : ''}
                    ${p.computeStage ? '<span class="webgpu-stage-badge cs">CS</span>' : ''}
                  </span>
                </div>
              `
                )
                .join('')}
            </div>
          `
          }
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">About WGSL</div>
          <div class="webgpu-info-box">
            <p><strong>WGSL</strong> (WebGPU Shading Language) is the shader language for WebGPU.</p>
            <p>Unlike GLSL, WGSL is designed specifically for the web with:</p>
            <ul>
              <li>Rust-like syntax</li>
              <li>Explicit types</li>
              <li>Memory safety features</li>
              <li>Consistent behavior across browsers</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  private renderWebGPUTimingTab(): string {
    const stats = this.latestStats;
    const gpuTiming = stats?.webgpuExtras?.gpuTiming;
    const gpuTimeMs = stats?.gpuTimeMs;

    // Check if timestamp queries are available
    const hasTimestampQueries = gpuTiming && gpuTiming.passes.length > 0;

    if (!hasTimestampQueries) {
      return `
        <div class="webgpu-timing">
          <div class="webgpu-info">
            <div class="webgpu-info-icon">⏱️</div>
            <div class="webgpu-info-title">GPU Timing</div>
            <div class="webgpu-info-desc">
              GPU timing via timestamp queries provides accurate per-pass breakdown of GPU execution time.
            </div>
          </div>
          
          ${
            gpuTimeMs !== undefined
              ? `
            <div class="webgpu-section">
              <div class="webgpu-section-header">Estimated GPU Time</div>
              <div class="webgpu-timing-summary">
                <div class="webgpu-timing-total">
                  <span class="webgpu-timing-value">${gpuTimeMs.toFixed(2)}</span>
                  <span class="webgpu-timing-unit">ms</span>
                </div>
                <p class="webgpu-hint">This is an estimate. Enable timestamp queries for accurate per-pass breakdown.</p>
              </div>
            </div>
          `
              : ''
          }
          
          <div class="webgpu-section">
            <div class="webgpu-section-header">Timestamp Query Requirements</div>
            <div class="webgpu-info-box">
              <p><strong>Requirements:</strong></p>
              <ul>
                <li>WebGPU device with <code>timestamp-query</code> feature</li>
                <li>Browser support (Chrome 113+, Edge 113+)</li>
                <li>Renderer must be initialized with timestamp queries enabled</li>
              </ul>
              <p><strong>Note:</strong> Some browsers may require a flag to enable timestamp queries for privacy reasons.</p>
            </div>
          </div>
        </div>
      `;
    }

    // Calculate totals and percentages
    const totalMs = gpuTiming.totalMs;
    const passes = gpuTiming.passes;
    const _breakdown = gpuTiming.breakdown;

    // Sort passes by duration
    const sortedPasses = [...passes].sort(
      (a, b) => b.durationMs - a.durationMs
    );

    // Get pass type colors
    const passColors: Record<string, string> = {
      shadow: '#9333EA',
      opaque: '#3B82F6',
      transparent: '#10B981',
      'post-process': '#F59E0B',
      compute: '#EF4444',
      copy: '#6B7280',
    };

    const getPassColor = (name: string): string => {
      const lowerName = name.toLowerCase();
      for (const [key, color] of Object.entries(passColors)) {
        if (lowerName.includes(key)) return color;
      }
      return '#8B5CF6'; // Default purple
    };

    return `
      <div class="webgpu-timing">
        <div class="webgpu-section">
          <div class="webgpu-section-header">
            <span>GPU Frame Time</span>
            <span class="webgpu-timing-badge">${totalMs.toFixed(2)} ms</span>
          </div>
          
          <div class="webgpu-timing-bar-container">
            <div class="webgpu-timing-bar">
              ${sortedPasses
                .map((pass, _i) => {
                  const pct =
                    totalMs > 0 ? (pass.durationMs / totalMs) * 100 : 0;
                  const color = getPassColor(pass.name);
                  return `<div class="webgpu-timing-bar-segment" style="width: ${pct}%; background: ${color};" title="${pass.name}: ${pass.durationMs.toFixed(2)}ms"></div>`;
                })
                .join('')}
            </div>
          </div>
          
          <div class="webgpu-timing-legend">
            ${sortedPasses
              .map((pass) => {
                const pct = totalMs > 0 ? (pass.durationMs / totalMs) * 100 : 0;
                const color = getPassColor(pass.name);
                return `
                <div class="webgpu-timing-legend-item">
                  <span class="webgpu-timing-legend-color" style="background: ${color};"></span>
                  <span class="webgpu-timing-legend-name">${this.escapeHtml(pass.name)}</span>
                  <span class="webgpu-timing-legend-value">${pass.durationMs.toFixed(2)} ms</span>
                  <span class="webgpu-timing-legend-pct">${pct.toFixed(1)}%</span>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Pass Breakdown</div>
          <div class="webgpu-timing-passes">
            ${sortedPasses
              .map((pass) => {
                const pct = totalMs > 0 ? (pass.durationMs / totalMs) * 100 : 0;
                const color = getPassColor(pass.name);
                const isHot = pass.durationMs > totalMs * 0.3; // > 30% is considered hot
                return `
                <div class="webgpu-timing-pass ${isHot ? 'hot' : ''}">
                  <div class="webgpu-timing-pass-header">
                    <span class="webgpu-timing-pass-color" style="background: ${color};"></span>
                    <span class="webgpu-timing-pass-name">${this.escapeHtml(pass.name)}</span>
                    <span class="webgpu-timing-pass-time">${pass.durationMs.toFixed(2)} ms</span>
                  </div>
                  <div class="webgpu-timing-pass-bar">
                    <div class="webgpu-timing-pass-fill" style="width: ${pct}%; background: ${color};"></div>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Timing Analysis</div>
          <div class="webgpu-timing-analysis">
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Total GPU Time</span>
              <span class="webgpu-analysis-value">${totalMs.toFixed(2)} ms</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Target (60 FPS)</span>
              <span class="webgpu-analysis-value ${totalMs > 16.67 ? 'over' : 'ok'}">16.67 ms</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Budget Used</span>
              <span class="webgpu-analysis-value ${totalMs > 16.67 ? 'over' : 'ok'}">${((totalMs / 16.67) * 100).toFixed(0)}%</span>
            </div>
            <div class="webgpu-analysis-row">
              <span class="webgpu-analysis-label">Number of Passes</span>
              <span class="webgpu-analysis-value">${passes.length}</span>
            </div>
            ${
              sortedPasses.length > 0
                ? `
              <div class="webgpu-analysis-row">
                <span class="webgpu-analysis-label">Slowest Pass</span>
                <span class="webgpu-analysis-value">${this.escapeHtml(sortedPasses[0].name)}</span>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  private renderWebGPUCapabilitiesTab(): string {
    const stats = this.latestStats;
    const webgpuExtras = stats?.webgpuExtras;

    return `
      <div class="webgpu-capabilities">
        <div class="webgpu-section">
          <div class="webgpu-section-header">Current Frame Stats</div>
          <div class="webgpu-stats-grid">
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${webgpuExtras?.pipelinesUsed ?? '—'}</span>
              <span class="webgpu-stat-label">Pipelines</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${webgpuExtras?.renderPasses ?? '—'}</span>
              <span class="webgpu-stat-label">Render Passes</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${webgpuExtras?.computePasses ?? '—'}</span>
              <span class="webgpu-stat-label">Compute Passes</span>
            </div>
            <div class="webgpu-stat">
              <span class="webgpu-stat-value">${webgpuExtras?.bindGroupsUsed ?? '—'}</span>
              <span class="webgpu-stat-label">Bind Groups</span>
            </div>
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">Device Limits</div>
          <div class="webgpu-limits-info">
            <p class="webgpu-hint">
              Device limits are available via <code>getWebGPUCapabilities(renderer)</code>.
            </p>
          </div>
          <div class="webgpu-limits-grid">
            ${this.renderWebGPULimitsGrid()}
          </div>
        </div>
        
        <div class="webgpu-section">
          <div class="webgpu-section-header">WebGPU vs WebGL</div>
          <div class="webgpu-comparison">
            <div class="webgpu-compare-row header">
              <span>Feature</span>
              <span>WebGL</span>
              <span>WebGPU</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Compute Shaders</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Explicit Binding</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Pipeline State Objects</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Multi-threaded Commands</span>
              <span class="no">❌</span>
              <span class="yes">✅</span>
            </div>
            <div class="webgpu-compare-row">
              <span>Timestamp Queries</span>
              <span class="partial">⚠️</span>
              <span class="yes">✅</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderWebGPULimitsGrid(): string {
    // These would come from getWebGPUCapabilities if available
    const limits = [
      { name: 'Max Texture Size 2D', value: '16384' },
      { name: 'Max Bind Groups', value: '4' },
      { name: 'Max Bindings/Group', value: '1000' },
      { name: 'Max Uniform Buffer', value: '64KB' },
      { name: 'Max Storage Buffer', value: '128MB' },
      { name: 'Max Vertex Buffers', value: '8' },
      { name: 'Max Vertex Attributes', value: '16' },
      { name: 'Max Compute Workgroup', value: '256' },
    ];

    return limits
      .map(
        (l) => `
      <div class="webgpu-limit">
        <span class="webgpu-limit-name">${l.name}</span>
        <span class="webgpu-limit-value">${l.value}</span>
      </div>
    `
      )
      .join('');
  }

  private attachWebGPUPanelEvents(container: HTMLElement): void {
    // Tab switching
    container.querySelectorAll('.webgpu-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.webgpuTab = (tab as HTMLElement).dataset
          .tab as typeof this.webgpuTab;
        this.updateWebGPUPanel();
      });
    });

    // Pipeline selection
    container.querySelectorAll('.webgpu-pipeline-item').forEach((item) => {
      item.addEventListener('click', () => {
        const pipelineId = (item as HTMLElement).dataset.pipelineId;
        this.selectedPipelineId =
          this.selectedPipelineId === pipelineId ? null : (pipelineId ?? null);
        this.updateWebGPUPanel();
      });
    });

    // Close pipeline details
    container
      .querySelector('[data-action="close-pipeline-details"]')
      ?.addEventListener('click', () => {
        this.selectedPipelineId = null;
        this.updateWebGPUPanel();
      });

    // Shader item click
    container.querySelectorAll('.webgpu-shader-item').forEach((item) => {
      item.addEventListener('click', () => {
        const pipelineId = (item as HTMLElement).dataset.pipelineId;
        if (pipelineId) {
          this.webgpuTab = 'pipelines';
          this.selectedPipelineId = pipelineId;
          this.updateWebGPUPanel();
        }
      });
    });
  }

  private updateWebGPUPanel(): void {
    const content = document.getElementById('three-lens-content-webgpu');
    if (!content) return;

    content.innerHTML = this.renderWebGPUContent();
    this.attachWebGPUPanelEvents(content);
  }

  private escapeHtml(str: string): string {
    return str.replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c] ?? c
    );
  }

  private mountPanel(panelId: string, panelElement: HTMLElement): void {
    const definition = this.panelDefinitions.get(panelId);
    const container = panelElement.querySelector(
      `#three-lens-content-${panelId}`
    ) as HTMLElement | null;
    if (!definition || !container) return;

    const state = this.openPanels.get(panelId);
    const context = this.buildPanelContext(
      panelId,
      container,
      panelElement,
      state
    );
    this.panelContexts.set(panelId, context);

    const content = this.renderPanelContent(panelId, context);
    this.applyPanelContent(container, content);
    definition.onMount?.(context);

    // Attach panel-specific events
    if (panelId === 'plugins') {
      this.attachPluginsPanelEvents(container);
    } else if (panelId === 'webgpu') {
      this.attachWebGPUPanelEvents(container);
    }
  }

  private applyPanelContent(
    container: HTMLElement,
    content: string | HTMLElement | void
  ): void {
    if (typeof content === 'string') {
      container.innerHTML = content;
      return;
    }
    if (content instanceof HTMLElement) {
      container.innerHTML = '';
      container.appendChild(content);
      return;
    }
    // If content is void, clear the container so onMount handlers can render freely
    container.innerHTML = '';
  }

  private buildPanelContext(
    panelId: string,
    container: HTMLElement,
    panelElement: HTMLElement,
    state?: PanelState | undefined
  ): OverlayPanelContext {
    return {
      panelId,
      container,
      panelElement,
      probe: this.probe,
      overlay: this,
      state: state ?? (this.openPanels.get(panelId) as PanelState),
    };
  }

  /**
   * Update the content of a panel (for plugin panels)
   */
  private updatePanelContent(panelId: string): void {
    const definition = this.panelDefinitions.get(panelId);
    const context = this.panelContexts.get(panelId);
    if (!definition || !context) return;

    // For panels with render functions (e.g. plugin panels)
    if (definition.render) {
      const result = definition.render(context);
      if (typeof result === 'string') {
        context.container.innerHTML = result;
      } else if (result instanceof HTMLElement) {
        context.container.innerHTML = '';
        context.container.appendChild(result);
      }
      // If void, assume the render function handles DOM manipulation directly
    }
  }

  private destroyPanel(panelId: string): void {
    const definition = this.panelDefinitions.get(panelId);
    const context = this.panelContexts.get(panelId);
    if (definition?.onDestroy && context) {
      definition.onDestroy(context);
    }
    this.panelContexts.delete(panelId);

    // Clean up virtual scroller when scene panel is closed
    if (panelId === 'scene' && this.virtualScroller) {
      this.virtualScroller.dispose();
      this.virtualScroller = null;
      this.virtualScrollContainer = null;
    }

    const el = document.getElementById(`three-lens-panel-${panelId}`);
    if (el) el.remove();
    this.openPanels.delete(panelId);
  }

  private attachPanelEvents(panel: HTMLElement, panelId: string): void {
    // Header drag
    const header = panel.querySelector(
      '.three-lens-panel-header'
    ) as HTMLElement;
    header?.addEventListener('mousedown', (e) => {
      // Don't start drag on buttons or search input
      if ((e.target as HTMLElement).closest('.three-lens-panel-btn')) return;
      if ((e.target as HTMLElement).closest('.three-lens-header-search'))
        return;
      this.startDrag(panelId, e);
    });

    // Header search input
    const headerSearch = panel.querySelector(
      '.header-search-input'
    ) as HTMLInputElement;
    if (headerSearch) {
      headerSearch.addEventListener('input', () => {
        const searchKey =
          panelId === 'materials'
            ? 'materialsSearch'
            : panelId === 'geometry'
              ? 'geometrySearch'
              : 'texturesSearch';
        this.updateUIState({
          [searchKey]: headerSearch.value,
        } as Partial<UIState>);
        this.updatePanelById(panelId);
      });
    }

    // Focus on click
    panel.addEventListener('mousedown', () => {
      this.focusPanel(panelId);
    });

    // Control buttons
    panel.querySelectorAll('.three-lens-panel-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        if (action === 'close') this.closePanel(panelId);
        if (action === 'minimize') this.toggleMinimize(panelId);
      });
    });

    // Resize handle
    const resize = panel.querySelector(
      '.three-lens-panel-resize'
    ) as HTMLElement;
    resize?.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.startResize(panelId, e);
    });

    // Tree node events for scene panel
    if (panelId === 'scene') {
      this.attachTreeEvents(panel);
    }

    // Tab events for stats panel
    if (panelId === 'stats') {
      this.attachStatsTabEvents(panel);
    }

    // Shared panel events for Materials, Geometry, Textures
    if (panelId === 'materials') {
      this.attachMaterialsPanelEvents(panel);
    }

    if (panelId === 'geometry') {
      this.attachGeometryPanelEvents(panel);
    }

    if (panelId === 'textures') {
      this.attachTexturesPanelEvents(panel);
    }

    if (panelId === 'render-targets') {
      this.attachRenderTargetsPanelEvents(panel);
    }
  }

  private attachMaterialsPanelEvents(panel: HTMLElement): void {
    const container = panel.querySelector(
      `#three-lens-content-materials`
    ) as HTMLElement;
    if (!container) return;

    attachMaterialsEvents(
      container,
      this.buildSharedPanelContext(),
      this.uiState,
      (updates) => this.updateUIState(updates),
      () => this.updateMaterialsPanel()
    );
  }

  private attachGeometryPanelEvents(panel: HTMLElement): void {
    const container = panel.querySelector(
      `#three-lens-content-geometry`
    ) as HTMLElement;
    if (!container) return;

    attachGeometryEvents(
      container,
      this.buildSharedPanelContext(),
      this.uiState,
      (updates) => this.updateUIState(updates),
      () => this.updateGeometryPanel()
    );
  }

  private attachTexturesPanelEvents(panel: HTMLElement): void {
    const container = panel.querySelector(
      `#three-lens-content-textures`
    ) as HTMLElement;
    if (!container) return;

    attachTexturesEvents(
      container,
      this.buildSharedPanelContext(),
      this.uiState,
      (updates) => this.updateUIState(updates),
      () => this.updateTexturesPanel()
    );
  }

  private attachRenderTargetsPanelEvents(panel: HTMLElement): void {
    const container = panel.querySelector(
      `#three-lens-content-render-targets`
    ) as HTMLElement;
    if (!container) return;

    attachRenderTargetsEvents(
      container,
      this.buildSharedPanelContext(),
      this.uiState,
      (updates) => this.updateUIState(updates),
      () => this.updateRenderTargetsPanel()
    );
  }

  private updateMaterialsPanel(): void {
    const content = document.getElementById('three-lens-content-materials');
    if (!content) return;

    content.innerHTML = this.renderMaterialsContent();
    const panel = document.getElementById('three-lens-panel-materials');
    if (panel) this.attachMaterialsPanelEvents(panel);
  }

  private updateGeometryPanel(): void {
    const content = document.getElementById('three-lens-content-geometry');
    if (!content) return;

    content.innerHTML = this.renderGeometryContent();
    const panel = document.getElementById('three-lens-panel-geometry');
    if (panel) this.attachGeometryPanelEvents(panel);
  }

  private updateTexturesPanel(): void {
    const content = document.getElementById('three-lens-content-textures');
    if (!content) return;

    content.innerHTML = this.renderTexturesContent();
    const panel = document.getElementById('three-lens-panel-textures');
    if (panel) this.attachTexturesPanelEvents(panel);
  }

  private updateRenderTargetsPanel(): void {
    const content = document.getElementById(
      'three-lens-content-render-targets'
    );
    if (!content) return;

    content.innerHTML = this.renderRenderTargetsContent();
    const panel = document.getElementById('three-lens-panel-render-targets');
    if (panel) this.attachRenderTargetsPanelEvents(panel);
  }

  private updatePanelById(panelId: string): void {
    switch (panelId) {
      case 'materials':
        this.updateMaterialsPanel();
        break;
      case 'geometry':
        this.updateGeometryPanel();
        break;
      case 'textures':
        this.updateTexturesPanel();
        break;
      case 'render-targets':
        this.updateRenderTargetsPanel();
        break;
    }
  }

  private focusPanel(panelId: string): void {
    const state = this.openPanels.get(panelId);
    if (!state) return;

    state.zIndex = ++this.topZIndex;
    const el = document.getElementById(`three-lens-panel-${panelId}`);
    if (el) {
      el.style.zIndex = String(state.zIndex);
      document
        .querySelectorAll('.three-lens-panel')
        .forEach((p) => p.classList.remove('focused'));
      el.classList.add('focused');
    }
  }

  private toggleMinimize(panelId: string): void {
    const state = this.openPanels.get(panelId);
    if (!state) return;

    state.minimized = !state.minimized;
    const el = document.getElementById(`three-lens-panel-${panelId}`);
    if (el) {
      el.classList.toggle('minimized', state.minimized);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DRAG & RESIZE
  // ═══════════════════════════════════════════════════════════════

  private startDrag(panelId: string, e: MouseEvent): void {
    const state = this.openPanels.get(panelId);
    if (!state) return;

    // If panel is docked, don't allow dragging (use popout instead)
    if (state.docked) {
      return;
    }

    this.dragState = {
      panelId,
      startX: e.clientX,
      startY: e.clientY,
      startPanelX: state.x,
      startPanelY: state.y,
    };

    this.focusPanel(panelId);
  }

  private startResize(panelId: string, e: MouseEvent): void {
    const state = this.openPanels.get(panelId);
    if (!state) return;

    const el = document.getElementById(`three-lens-panel-${panelId}`);
    if (!el) return;

    // Get actual computed dimensions (important for auto-height panels)
    const rect = el.getBoundingClientRect();

    // Add resizing class to disable transitions
    el.classList.add('resizing');

    // For auto-height panels, switch to explicit height mode
    el.style.height = `${rect.height}px`;
    el.style.maxHeight = 'none';
    state.height = rect.height;

    this.resizeState = {
      panelId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };

    this.focusPanel(panelId);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.dragState) {
      const state = this.openPanels.get(this.dragState.panelId);
      if (!state) return;

      // Check if dragging over sidebar (in sidebar mode)
      if (this.layoutMode === 'sidebar') {
        const sidebar = document.getElementById('three-lens-sidebar');
        if (sidebar) {
          const sidebarRect = sidebar.getBoundingClientRect();
          const isOverSidebar =
            e.clientX >= sidebarRect.left &&
            e.clientX <= sidebarRect.right &&
            e.clientY >= sidebarRect.top &&
            e.clientY <= sidebarRect.bottom;

          // Visual feedback
          if (isOverSidebar && !state.docked) {
            sidebar.classList.add('drag-target');
          } else {
            sidebar.classList.remove('drag-target');
          }
        }
      }

      const dx = e.clientX - this.dragState.startX;
      const dy = e.clientY - this.dragState.startY;

      state.x = Math.max(0, this.dragState.startPanelX + dx);
      state.y = Math.max(0, this.dragState.startPanelY + dy);

      const el = document.getElementById(
        `three-lens-panel-${this.dragState.panelId}`
      );
      if (el) {
        el.style.left = `${state.x}px`;
        el.style.top = `${state.y}px`;
      }
    }

    if (this.resizeState) {
      const state = this.openPanels.get(this.resizeState.panelId);
      if (!state) return;

      const dx = e.clientX - this.resizeState.startX;
      const dy = e.clientY - this.resizeState.startY;

      state.width = Math.max(280, this.resizeState.startWidth + dx);
      state.height = Math.max(100, this.resizeState.startHeight + dy);

      const el = document.getElementById(
        `three-lens-panel-${this.resizeState.panelId}`
      );
      if (el) {
        el.style.width = `${state.width}px`;
        el.style.height = `${state.height}px`;
      }
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    // Check if we should dock a floating panel
    if (this.dragState && this.layoutMode === 'sidebar') {
      const sidebar = document.getElementById('three-lens-sidebar');
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const isOverSidebar =
          e.clientX >= sidebarRect.left &&
          e.clientX <= sidebarRect.right &&
          e.clientY >= sidebarRect.top &&
          e.clientY <= sidebarRect.bottom;

        if (isOverSidebar) {
          const state = this.openPanels.get(this.dragState.panelId);
          if (state && !state.docked) {
            this.dockPanel(this.dragState.panelId);
          }
        }
      }
      // Remove drag target class
      sidebar?.classList.remove('drag-target');
    }

    // Remove resizing class when done
    if (this.resizeState) {
      const el = document.getElementById(
        `three-lens-panel-${this.resizeState.panelId}`
      );
      if (el) {
        el.classList.remove('resizing');
      }
    }

    this.dragState = null;
    this.resizeState = null;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Ctrl+Shift+D to toggle menu
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      this.menuVisible = !this.menuVisible;
      this.updateMenu();
      e.preventDefault();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PANEL CONTENT RENDERING
  // ═══════════════════════════════════════════════════════════════

  private renderPanelContent(
    panelId: string,
    context?: OverlayPanelContext
  ): string | HTMLElement | void {
    switch (panelId) {
      case 'scene':
        return this.renderSceneContent();
      case 'stats':
        return this.renderStatsContent();
      case 'materials':
        return this.renderMaterialsContent();
      case 'geometry':
        return this.renderGeometryContent();
      case 'textures':
        return this.renderTexturesContent();
      case 'render-targets':
        return this.renderRenderTargetsContent();
      case 'webgpu':
        return this.renderWebGPUContent();
      case 'plugins':
        return this.renderPluginsContent();
      default: {
        const definition = this.panelDefinitions.get(panelId);
        if (definition?.render) {
          if (!context)
            return '<div class="three-lens-inspector-empty">Panel content</div>';
          return definition.render(context);
        }
        return '<div class="three-lens-inspector-empty">Panel content</div>';
      }
    }
  }

  private renderSceneContent(): string {
    const scenes = this.probe.getObservedScenes();
    if (scenes.length === 0) {
      return `<div class="three-lens-inspector-empty">No scenes observed</div>`;
    }

    const snapshot = this.probe.takeSnapshot();

    // Auto-expand root scenes and their direct children for immediate visibility
    for (const scene of snapshot.scenes) {
      this.expandedNodes.add(scene.ref.debugId);
      // Also expand first few children to show content immediately
      for (const child of scene.children.slice(0, 3)) {
        if (child.children.length > 0) {
          this.expandedNodes.add(child.ref.debugId);
        }
      }
    }

    // Find selected node for inspector
    const selectedNode = this.selectedNodeId
      ? this.findNodeById(snapshot.scenes, this.selectedNodeId)
      : null;

    // Count total nodes to decide if virtual scrolling is needed
    const totalNodes = snapshot.scenes.reduce(
      (sum, scene) => sum + countTreeNodes(scene),
      0
    );
    const useVirtualScroll = totalNodes > this.virtualScrollThreshold;

    if (useVirtualScroll) {
      // Use virtual scrolling for large trees
      return `
        <div class="three-lens-split-view">
          <div class="three-lens-tree-pane">
            <div class="three-lens-virtual-scroll-container" id="three-lens-virtual-tree">
              <div class="three-lens-virtual-scroll-content"></div>
            </div>
          </div>
          <div class="three-lens-inspector-pane">
          ${selectedNode ? this.renderNodeInspector(selectedNode) : this.renderGlobalTools()}
          </div>
        </div>
      `;
    }

    // Standard rendering for smaller trees
    return `
        <div class="three-lens-split-view">
          <div class="three-lens-tree-pane">
            <div class="three-lens-tree">${snapshot.scenes.map((scene) => this.renderNode(scene)).join('')}</div>
          </div>
          <div class="three-lens-inspector-pane">
          ${selectedNode ? this.renderNodeInspector(selectedNode) : this.renderGlobalTools()}
          </div>
      </div>
    `;
  }

  /**
   * Initialize virtual scrolling for scene tree after DOM is ready
   */
  private initVirtualScroller(): void {
    const container = document.getElementById('three-lens-virtual-tree');
    if (!container) return;

    // Get current snapshot
    const snapshot = this.probe.takeSnapshot();
    if (snapshot.scenes.length === 0) return;

    // Create virtual scroller if not exists
    if (!this.virtualScroller) {
      this.virtualScroller = new VirtualScroller<SceneNode>({
        container,
        getChildren: (node) => node.children,
        getId: (node) => node.ref.debugId,
        isExpanded: (id) => this.expandedNodes.has(id),
        renderRow: (flatNode) => this.renderVirtualTreeNode(flatNode),
        rowHeight: 28,
        overscan: 5,
      });
      // Set initial data after construction
      this.virtualScroller.setData(snapshot.scenes);
    } else {
      // Update with new data
      this.virtualScroller.setData(snapshot.scenes);
    }

    this.virtualScrollContainer = container;
  }

  /**
   * Render a single tree node for virtual scrolling
   */
  private renderVirtualTreeNode(flatNode: FlattenedNode<SceneNode>): string {
    const node = flatNode.data;
    const hasChildren = node.children.length > 0;
    const isExpanded = this.expandedNodes.has(node.ref.debugId);
    const isSelected = this.selectedNodeId === node.ref.debugId;
    const isVisible = node.visible;

    // Get cost level for heatmap coloring (only for meshes)
    const costLevel = node.meshData?.costData?.costLevel || '';
    const costClass = costLevel ? `cost-${costLevel}` : '';

    // Calculate indentation based on depth
    const indentPx = flatNode.depth * 16;

    return `
      <div class="three-lens-virtual-row" data-id="${node.ref.debugId}" data-depth="${flatNode.depth}" style="padding-left: ${indentPx}px;">
        <div class="three-lens-node-header ${isSelected ? 'selected' : ''} ${!isVisible ? 'hidden-object' : ''} ${costClass}">
          <span class="three-lens-node-toggle ${hasChildren ? (isExpanded ? 'expanded' : '') : 'hidden'}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1L6 4L2 7z"/></svg>
          </span>
          <span class="three-lens-node-icon ${getObjectClass(node.ref.type)}">${getObjectIcon(node.ref.type)}</span>
          <span class="three-lens-node-name ${!node.ref.name ? 'unnamed' : ''}">${node.ref.name || 'unnamed'}</span>
          ${costLevel ? `<span class="three-lens-cost-indicator ${costClass}" title="Cost: ${costLevel}">${this.getCostIcon(costLevel)}</span>` : ''}
          <button class="three-lens-visibility-btn ${isVisible ? 'visible' : 'hidden'}" data-id="${node.ref.debugId}" title="${isVisible ? 'Hide object' : 'Show object'}">
            ${isVisible ? this.getEyeOpenIcon() : this.getEyeClosedIcon()}
          </button>
          <span class="three-lens-node-spacer"></span>
          <span class="three-lens-node-type">${node.ref.type}</span>
        </div>
      </div>
    `;
  }

  private renderNode(node: SceneNode): string {
    const hasChildren = node.children.length > 0;
    const isExpanded = this.expandedNodes.has(node.ref.debugId);
    const isSelected = this.selectedNodeId === node.ref.debugId;
    const isVisible = node.visible;

    // Get cost level for heatmap coloring (only for meshes)
    const costLevel = node.meshData?.costData?.costLevel || '';
    const costClass = costLevel ? `cost-${costLevel}` : '';

    return `
      <div class="three-lens-node" data-id="${node.ref.debugId}">
        <div class="three-lens-node-header ${isSelected ? 'selected' : ''} ${!isVisible ? 'hidden-object' : ''} ${costClass}">
          <span class="three-lens-node-toggle ${hasChildren ? (isExpanded ? 'expanded' : '') : 'hidden'}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1L6 4L2 7z"/></svg>
          </span>
          <span class="three-lens-node-icon ${getObjectClass(node.ref.type)}">${getObjectIcon(node.ref.type)}</span>
          <span class="three-lens-node-name ${!node.ref.name ? 'unnamed' : ''}">${node.ref.name || 'unnamed'}</span>
          ${costLevel ? `<span class="three-lens-cost-indicator ${costClass}" title="Cost: ${costLevel}">${this.getCostIcon(costLevel)}</span>` : ''}
          <button class="three-lens-visibility-btn ${isVisible ? 'visible' : 'hidden'}" data-id="${node.ref.debugId}" title="${isVisible ? 'Hide object' : 'Show object'}">
            ${isVisible ? this.getEyeOpenIcon() : this.getEyeClosedIcon()}
          </button>
          <span class="three-lens-node-spacer"></span>
          <span class="three-lens-node-type">${node.ref.type}</span>
        </div>
        ${hasChildren && isExpanded ? `<div class="three-lens-node-children">${node.children.map((c) => this.renderNode(c)).join('')}</div>` : ''}
      </div>
    `;
  }

  private getCostIcon(costLevel: string): string {
    switch (costLevel) {
      case 'low':
        return '●';
      case 'medium':
        return '●';
      case 'high':
        return '●';
      case 'critical':
        return '🔥';
      default:
        return '';
    }
  }

  private getEyeOpenIcon(): string {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`;
  }

  private getEyeClosedIcon(): string {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`;
  }

  private renderStatsContent(): string {
    const stats = this.latestStats;
    if (!stats) {
      return `<div class="three-lens-inspector-empty">Waiting for frame data...</div>`;
    }

    const benchmark = this.latestBenchmark;
    const fps =
      stats.performance?.fps ??
      (stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0);
    const fpsSmoothed = stats.performance?.fpsSmoothed ?? fps;
    const fps1Low = stats.performance?.fps1PercentLow ?? 0;

    return `
      <div class="three-lens-tabs" id="three-lens-stats-tabs">
        <button class="three-lens-tab ${this.statsTab === 'overview' ? 'active' : ''}" data-tab="overview">Overview</button>
        <button class="three-lens-tab ${this.statsTab === 'memory' ? 'active' : ''}" data-tab="memory">Memory</button>
        <button class="three-lens-tab ${this.statsTab === 'rendering' ? 'active' : ''}" data-tab="rendering">Rendering</button>
        <button class="three-lens-tab ${this.statsTab === 'timeline' ? 'active' : ''}" data-tab="timeline">Frames</button>
        <button class="three-lens-tab ${this.statsTab === 'resources' ? 'active' : ''}" data-tab="resources">Resources</button>
      </div>
      <div class="three-lens-stats-tab-content" id="three-lens-stats-tab-content">
        ${this.statsTab === 'overview' ? this.renderOverviewTab(stats, benchmark, fps, fpsSmoothed, fps1Low) : ''}
        ${this.statsTab === 'memory' ? this.renderMemoryTab(stats) : ''}
        ${this.statsTab === 'rendering' ? this.renderRenderingTab(stats) : ''}
        ${this.statsTab === 'timeline' ? this.renderTimelineTab(stats) : ''}
        ${this.statsTab === 'resources' ? this.renderResourcesTab() : ''}
      </div>
    `;
  }

  private renderOverviewTab(
    stats: FrameStats,
    benchmark: BenchmarkScore | null,
    fps: number,
    fpsSmoothed: number,
    fps1Low: number
  ): string {
    const budgetUsed =
      stats.performance?.frameBudgetUsed ?? (stats.cpuTimeMs / 16.67) * 100;
    const _isSmooth = stats.performance?.isSmooth ?? stats.cpuTimeMs <= 18;

    return `
      ${benchmark ? this.renderBenchmarkScore(benchmark) : ''}
      <div class="three-lens-stats-grid">
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">FPS</div>
          <div class="three-lens-stat-value ${fps < 30 ? 'error' : fps < 55 ? 'warning' : ''}">${fps}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">CPU Time</div>
          <div class="three-lens-stat-value ${stats.cpuTimeMs > 16.67 ? 'warning' : ''}">${stats.cpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
        </div>
        ${
          stats.gpuTimeMs !== undefined
            ? `
          <div class="three-lens-stat-card gpu">
            <div class="three-lens-stat-label">GPU Time</div>
            <div class="three-lens-stat-value ${stats.gpuTimeMs > 16.67 ? 'warning' : ''}">${stats.gpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
          </div>
        `
            : ''
        }
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Draw Calls</div>
          <div class="three-lens-stat-value ${stats.drawCalls > 1000 ? 'warning' : ''}">${formatNumber(stats.drawCalls)}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Triangles</div>
          <div class="three-lens-stat-value ${stats.triangles > 500000 ? 'warning' : ''}">${formatNumber(stats.triangles)}</div>
        </div>
      </div>
      
      <!-- Frame Time Chart -->
      <div class="three-lens-chart">
        <div class="three-lens-chart-header">
          <span class="three-lens-chart-title">Frame Time</span>
          <div class="three-lens-chart-controls">
            <button class="three-lens-chart-btn" id="three-lens-chart-zoom-out" title="Zoom Out">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="6" x2="10" y2="6"/>
              </svg>
            </button>
            <span class="three-lens-chart-zoom-label" id="three-lens-chart-zoom-label">${this.getVisibleFrameCount()}f</span>
            <button class="three-lens-chart-btn" id="three-lens-chart-zoom-in" title="Zoom In">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="2" y1="6" x2="10" y2="6"/>
                <line x1="6" y1="2" x2="6" y2="10"/>
              </svg>
            </button>
            <button class="three-lens-chart-btn" id="three-lens-chart-reset" title="Reset View">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 4.5a5 5 0 1 1 0 3"/>
                <path d="M1 1v4h4"/>
              </svg>
            </button>
          </div>
          <span class="three-lens-chart-value">${stats.cpuTimeMs.toFixed(2)}ms</span>
        </div>
        <div class="three-lens-chart-container" id="three-lens-chart-container">
          <canvas class="three-lens-chart-canvas" id="three-lens-stats-chart"></canvas>
          <div class="three-lens-chart-tooltip" id="three-lens-chart-tooltip" style="display: none;">
            <div class="three-lens-tooltip-time"></div>
            <div class="three-lens-tooltip-fps"></div>
          </div>
        </div>
        <div class="three-lens-chart-stats">
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Min</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-min">${this.getFrameTimeMin().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Avg</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-avg">${this.getFrameTimeAvg().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Max</span>
            <span class="three-lens-chart-stat-value warning" id="three-lens-chart-max">${this.getFrameTimeMax().toFixed(1)}ms</span>
          </div>
          <div class="three-lens-chart-stat">
            <span class="three-lens-chart-stat-label">Jitter</span>
            <span class="three-lens-chart-stat-value" id="three-lens-chart-jitter">${this.getFrameTimeJitter().toFixed(1)}ms</span>
          </div>
        </div>
          </div>
      
      <!-- FPS Histogram -->
      ${this.renderFpsHistogram()}
      
      <!-- Frame Time Percentiles -->
      ${this.renderFrameTimePercentiles(fpsSmoothed, fps1Low, budgetUsed)}
      
      <!-- Frame Budget Gauge -->
      ${this.renderFrameBudgetGauge(stats, budgetUsed)}
      
      <!-- Bottleneck Analysis -->
      ${this.renderBottleneckAnalysis(stats)}
      
      <!-- Session Statistics -->
      ${this.renderSessionStatistics()}
      
      <!-- Rule Violations -->
      ${this.renderRuleViolations()}
      
      ${benchmark && benchmark.topIssues.length > 0 ? this.renderIssues(benchmark) : ''}
    `;
  }

  private renderRuleViolations(): string {
    const violations = this.probe.getRecentViolations();
    const summary = this.probe.getViolationSummary();

    if (violations.length === 0) {
      return '';
    }

    const recentViolations = violations.slice(-10).reverse();

    return `
      <div class="three-lens-rule-violations">
        <div class="three-lens-rule-violations-header">
          <span class="three-lens-rule-violations-title">⚠ Rule Violations</span>
          <div class="three-lens-rule-violations-badges">
            ${summary.errors > 0 ? `<span class="three-lens-violation-badge error">${summary.errors}</span>` : ''}
            ${summary.warnings > 0 ? `<span class="three-lens-violation-badge warning">${summary.warnings}</span>` : ''}
          </div>
          <button class="three-lens-action-btn small" data-action="clear-violations" title="Clear violations">✕</button>
          </div>
        <div class="three-lens-rule-violations-list">
          ${recentViolations
            .map(
              (v) => `
            <div class="three-lens-violation-item ${v.severity}">
              <span class="three-lens-violation-severity">${this.getViolationIcon(v.severity)}</span>
              <span class="three-lens-violation-message">${v.message}</span>
              <span class="three-lens-violation-time">${this.formatViolationTime(v.timestamp)}</span>
        </div>
          `
            )
            .join('')}
      </div>
        ${violations.length > 10 ? `<div class="three-lens-violations-more">+ ${violations.length - 10} more violations...</div>` : ''}
      </div>
    `;
  }

  private getViolationIcon(severity: string): string {
    switch (severity) {
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return '🔵';
      default:
        return '⚪';
    }
  }

  private formatViolationTime(timestamp: number): string {
    const age = performance.now() - timestamp;
    if (age < 1000) return 'now';
    if (age < 60000) return `${Math.round(age / 1000)}s`;
    return `${Math.round(age / 60000)}m`;
  }

  private renderFpsHistogram(): string {
    const maxCount = Math.max(...this.fpsHistogram, 1);
    const totalFrames = this.fpsHistogram.reduce((a, b) => a + b, 0);

    if (totalFrames < 10) {
      return `
        <div class="three-lens-histogram">
          <div class="three-lens-histogram-title">FPS Distribution</div>
          <div class="three-lens-histogram-empty">Collecting data...</div>
          </div>
      `;
    }

    const bucketLabels = [
      '0-5',
      '5-10',
      '10-15',
      '15-20',
      '20-25',
      '25-30',
      '30-35',
      '35-40',
      '40-45',
      '45-50',
      '50-55',
      '55+',
    ];

    return `
      <div class="three-lens-histogram">
        <div class="three-lens-histogram-header">
          <div class="three-lens-histogram-title">FPS Distribution</div>
          <div class="three-lens-histogram-total">${totalFrames} frames</div>
          </div>
        <div class="three-lens-histogram-chart">
          ${this.fpsHistogram
            .map((count, i) => {
              const height = (count / maxCount) * 100;
              const percent =
                totalFrames > 0 ? ((count / totalFrames) * 100).toFixed(1) : 0;
              const isGood = i >= 10; // 50+ FPS
              const isOk = i >= 6 && i < 10; // 30-50 FPS
              const _isBad = i < 6; // <30 FPS
              const colorClass = isGood ? 'good' : isOk ? 'ok' : 'bad';
              return `
              <div class="three-lens-histogram-bar-wrapper" title="${bucketLabels[i]} FPS: ${count} frames (${percent}%)">
                <div class="three-lens-histogram-bar ${colorClass}" style="height: ${height}%"></div>
                <div class="three-lens-histogram-label">${i === 11 ? '55+' : i * 5}</div>
        </div>
            `;
            })
            .join('')}
      </div>
        <div class="three-lens-histogram-legend">
          <span class="three-lens-histogram-legend-item bad">●&nbsp;Slow</span>
          <span class="three-lens-histogram-legend-item ok">●&nbsp;Okay</span>
          <span class="three-lens-histogram-legend-item good">●&nbsp;Smooth</span>
        </div>
      </div>
    `;
  }

  private renderFrameTimePercentiles(
    fpsSmoothed: number,
    fps1Low: number,
    budgetUsed: number
  ): string {
    return `
      <div class="three-lens-percentiles-section">
        <div class="three-lens-percentiles-title">Frame Time Percentiles</div>
        <div class="three-lens-percentiles-grid">
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P50</div>
            <div class="three-lens-percentile-value">${this.frameTimePercentiles.p50.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P90</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p90 > 16.67 ? 'warning' : ''}">${this.frameTimePercentiles.p90.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P95</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p95 > 16.67 ? 'warning' : ''}">${this.frameTimePercentiles.p95.toFixed(1)}ms</div>
          </div>
          <div class="three-lens-percentile-item">
            <div class="three-lens-percentile-label">P99</div>
            <div class="three-lens-percentile-value ${this.frameTimePercentiles.p99 > 33.33 ? 'error' : this.frameTimePercentiles.p99 > 16.67 ? 'warning' : ''}">${this.frameTimePercentiles.p99.toFixed(1)}ms</div>
          </div>
        </div>
        <div class="three-lens-percentiles-summary">
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">Avg FPS:</span>
            <span class="three-lens-percentile-summary-value">${fpsSmoothed}</span>
          </div>
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">1% Low:</span>
            <span class="three-lens-percentile-summary-value">${Math.round(fps1Low)}</span>
          </div>
          <div class="three-lens-percentile-summary-item">
            <span class="three-lens-percentile-summary-label">Budget:</span>
            <span class="three-lens-percentile-summary-value ${budgetUsed > 100 ? 'warning' : ''}">${budgetUsed.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderBottleneckAnalysis(stats: FrameStats): string {
    const bottlenecks: {
      type: string;
      severity: 'low' | 'medium' | 'high';
      message: string;
      suggestion: string;
    }[] = [];

    // Analyze potential bottlenecks
    if (stats.drawCalls > 500) {
      const severity =
        stats.drawCalls > 1000
          ? 'high'
          : stats.drawCalls > 750
            ? 'medium'
            : 'low';
      bottlenecks.push({
        type: 'Draw Calls',
        severity,
        message: `${stats.drawCalls} draw calls per frame`,
        suggestion: 'Consider using instancing, merging geometries, or LOD',
      });
    }

    if (stats.triangles > 1000000) {
      const severity =
        stats.triangles > 2000000
          ? 'high'
          : stats.triangles > 1500000
            ? 'medium'
            : 'low';
      bottlenecks.push({
        type: 'Geometry',
        severity,
        message: `${formatNumber(stats.triangles)} triangles`,
        suggestion: 'Use LOD, occlusion culling, or reduce mesh complexity',
      });
    }

    const rendering = stats.rendering;
    if (rendering) {
      if (rendering.shadowCastingLights > 2) {
        bottlenecks.push({
          type: 'Shadows',
          severity: rendering.shadowCastingLights > 4 ? 'high' : 'medium',
          message: `${rendering.shadowCastingLights} shadow-casting lights`,
          suggestion: 'Reduce shadow-casting lights or use baked shadows',
        });
      }

      if (rendering.skinnedMeshes > 10) {
        bottlenecks.push({
          type: 'Animation',
          severity: rendering.skinnedMeshes > 20 ? 'high' : 'medium',
          message: `${rendering.skinnedMeshes} skinned meshes with ${rendering.totalBones} bones`,
          suggestion: 'Use LOD for animated characters or reduce bone counts',
        });
      }

      if (rendering.transparentObjects > 50) {
        bottlenecks.push({
          type: 'Transparency',
          severity: rendering.transparentObjects > 100 ? 'high' : 'medium',
          message: `${rendering.transparentObjects} transparent objects`,
          suggestion: 'Reduce transparent objects or use alpha cutout',
        });
      }
    }

    if (stats.memory) {
      const MB = 1024 * 1024;
      if (stats.memory.textureMemory > 256 * MB) {
        bottlenecks.push({
          type: 'Texture Memory',
          severity: stats.memory.textureMemory > 512 * MB ? 'high' : 'medium',
          message: `${formatBytes(stats.memory.textureMemory)} texture memory`,
          suggestion:
            'Use compressed textures (KTX2/Basis) or reduce texture sizes',
        });
      }
    }

    if (bottlenecks.length === 0) {
      return `
        <div class="three-lens-bottleneck-section">
          <div class="three-lens-bottleneck-title">Bottleneck Analysis</div>
          <div class="three-lens-bottleneck-ok">
            <span class="three-lens-bottleneck-ok-icon">✓</span>
            <span>No significant bottlenecks detected</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="three-lens-bottleneck-section">
        <div class="three-lens-bottleneck-title">Bottleneck Analysis</div>
        <div class="three-lens-bottleneck-list">
          ${bottlenecks
            .map(
              (b) => `
            <div class="three-lens-bottleneck-item ${b.severity}">
              <div class="three-lens-bottleneck-header">
                <span class="three-lens-bottleneck-type">${b.type}</span>
                <span class="three-lens-bottleneck-severity ${b.severity}">${b.severity.toUpperCase()}</span>
              </div>
              <div class="three-lens-bottleneck-message">${b.message}</div>
              <div class="three-lens-bottleneck-suggestion">💡 ${b.suggestion}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private renderFrameBudgetGauge(
    stats: FrameStats,
    budgetUsed: number
  ): string {
    const targetMs = 16.67; // 60 FPS target
    const frameTime = stats.cpuTimeMs;
    const remaining = Math.max(0, targetMs - frameTime);
    const overBudget = frameTime > targetMs;

    // Calculate gauge angle (0-180 degrees, with 0 being fully under budget)
    const angle = Math.min(180, (frameTime / (targetMs * 2)) * 180);

    // Determine status
    let status = 'excellent';
    let statusText = 'Excellent';
    if (budgetUsed > 120) {
      status = 'critical';
      statusText = 'Critical';
    } else if (budgetUsed > 100) {
      status = 'over';
      statusText = 'Over Budget';
    } else if (budgetUsed > 80) {
      status = 'warning';
      statusText = 'Warning';
    } else if (budgetUsed > 60) {
      status = 'good';
      statusText = 'Good';
    }

    return `
      <div class="three-lens-budget-gauge">
        <div class="three-lens-budget-gauge-header">
          <div class="three-lens-budget-gauge-title">Frame Budget</div>
          <div class="three-lens-budget-gauge-target">Target: ${targetMs.toFixed(2)}ms (60 FPS)</div>
        </div>
        <div class="three-lens-budget-gauge-visual">
          <svg viewBox="0 0 200 110" class="three-lens-gauge-svg">
            <!-- Background arc -->
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--3lens-bg-primary)" stroke-width="12" stroke-linecap="round"/>
            <!-- Colored segments -->
            <path d="M 20 100 A 80 80 0 0 1 65 32" fill="none" stroke="var(--3lens-accent-emerald)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 65 32 A 80 80 0 0 1 100 20" fill="none" stroke="var(--3lens-accent-cyan)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 100 20 A 80 80 0 0 1 135 32" fill="none" stroke="var(--3lens-warning)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <path d="M 135 32 A 80 80 0 0 1 180 100" fill="none" stroke="var(--3lens-error)" stroke-width="12" stroke-linecap="round" opacity="0.3"/>
            <!-- Needle -->
            <line x1="100" y1="100" x2="${100 + 60 * Math.cos(((angle - 180) * Math.PI) / 180)}" y2="${100 + 60 * Math.sin(((angle - 180) * Math.PI) / 180)}" 
                  stroke="var(--3lens-text-primary)" stroke-width="3" stroke-linecap="round"/>
            <circle cx="100" cy="100" r="6" fill="var(--3lens-text-primary)"/>
          </svg>
          <div class="three-lens-budget-gauge-value ${status}">
            <span class="three-lens-budget-gauge-number">${frameTime.toFixed(2)}</span>
            <span class="three-lens-budget-gauge-unit">ms</span>
          </div>
        </div>
        <div class="three-lens-budget-gauge-footer">
          <div class="three-lens-budget-gauge-status ${status}">${statusText}</div>
          <div class="three-lens-budget-gauge-remaining">
            ${
              overBudget
                ? `<span class="over">+${(frameTime - targetMs).toFixed(2)}ms over</span>`
                : `<span class="under">${remaining.toFixed(2)}ms remaining</span>`
            }
          </div>
        </div>
        <div class="three-lens-budget-gauge-breakdown">
          <div class="three-lens-budget-bar">
            <div class="three-lens-budget-bar-fill ${status}" style="width: ${Math.min(100, budgetUsed)}%"></div>
            ${budgetUsed > 100 ? `<div class="three-lens-budget-bar-over" style="width: ${Math.min(50, budgetUsed - 100)}%"></div>` : ''}
          </div>
          <div class="three-lens-budget-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderSessionStatistics(): string {
    const sessionDuration = (performance.now() - this.sessionStartTime) / 1000; // seconds
    const avgFps = this.totalFramesRendered / sessionDuration;
    const smoothPercent =
      this.totalFramesRendered > 0
        ? (this.smoothFrameCount / this.totalFramesRendered) * 100
        : 100;

    const formatDuration = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return mins > 0 ? `${mins}m ${s}s` : `${s}s`;
    };

    return `
      <div class="three-lens-session">
        <div class="three-lens-session-header">
          <div class="three-lens-session-title">Session Statistics</div>
          <div class="three-lens-session-duration">${formatDuration(sessionDuration)}</div>
        </div>
        <div class="three-lens-session-grid">
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${formatNumber(this.totalFramesRendered)}</div>
            <div class="three-lens-session-stat-label">Total Frames</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${avgFps.toFixed(1)}</div>
            <div class="three-lens-session-stat-label">Avg FPS</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value ${smoothPercent < 90 ? 'warning' : ''}">${smoothPercent.toFixed(1)}%</div>
            <div class="three-lens-session-stat-label">Smooth Frames</div>
          </div>
          <div class="three-lens-session-stat">
            <div class="three-lens-session-stat-value">${this.droppedFrameCount}</div>
            <div class="three-lens-session-stat-label">Dropped</div>
          </div>
        </div>
        <div class="three-lens-session-peaks">
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak FPS</span>
            <span class="three-lens-session-peak-value">${this.peakFps.toFixed(0)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Lowest FPS</span>
            <span class="three-lens-session-peak-value ${this.lowestFps < 30 ? 'warning' : ''}">${this.lowestFps === Infinity ? '--' : this.lowestFps.toFixed(0)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Draw Calls</span>
            <span class="three-lens-session-peak-value">${this.peakDrawCalls}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Triangles</span>
            <span class="three-lens-session-peak-value">${formatNumber(this.peakTriangles)}</span>
          </div>
          <div class="three-lens-session-peak">
            <span class="three-lens-session-peak-label">Peak Memory</span>
            <span class="three-lens-session-peak-value">${formatBytes(this.peakMemory)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderBenchmarkScore(benchmark: BenchmarkScore): string {
    const getBarClass = (score: number) =>
      score >= 80 ? 'good' : score >= 50 ? 'ok' : 'bad';

    return `
      <div class="three-lens-benchmark">
        <div class="three-lens-benchmark-header">
          <div class="three-lens-benchmark-score">
            <span class="three-lens-benchmark-value grade-${benchmark.grade}">${benchmark.overall}</span>
            <span class="three-lens-benchmark-label">/ 100</span>
          </div>
          <div class="three-lens-benchmark-grade ${benchmark.grade}">${benchmark.grade}</div>
        </div>
        <div class="three-lens-benchmark-bars">
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Timing</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${getBarClass(benchmark.breakdown.timing)}" style="width: ${benchmark.breakdown.timing}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${benchmark.breakdown.timing}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Draw Calls</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${getBarClass(benchmark.breakdown.drawCalls)}" style="width: ${benchmark.breakdown.drawCalls}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${benchmark.breakdown.drawCalls}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Geometry</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${getBarClass(benchmark.breakdown.geometry)}" style="width: ${benchmark.breakdown.geometry}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${benchmark.breakdown.geometry}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">Memory</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${getBarClass(benchmark.breakdown.memory)}" style="width: ${benchmark.breakdown.memory}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${benchmark.breakdown.memory}</span>
          </div>
          <div class="three-lens-benchmark-bar">
            <span class="three-lens-benchmark-bar-label">State Chg</span>
            <div class="three-lens-benchmark-bar-track">
              <div class="three-lens-benchmark-bar-fill ${getBarClass(benchmark.breakdown.stateChanges)}" style="width: ${benchmark.breakdown.stateChanges}%"></div>
            </div>
            <span class="three-lens-benchmark-bar-value">${benchmark.breakdown.stateChanges}</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderIssues(benchmark: BenchmarkScore): string {
    if (
      benchmark.topIssues.length === 0 &&
      benchmark.suggestions.length === 0
    ) {
      return '';
    }

    return `
      <div class="three-lens-issues">
        ${benchmark.topIssues
          .map(
            (issue) => `
          <div class="three-lens-issue warning">
            <span class="three-lens-issue-icon">⚠️</span>
            <span class="three-lens-issue-text">${issue}</span>
          </div>
        `
          )
          .join('')}
        ${benchmark.suggestions
          .slice(0, 2)
          .map(
            (suggestion) => `
          <div class="three-lens-suggestion">
            <span class="three-lens-issue-icon">💡</span>
            <span class="three-lens-suggestion-text">${suggestion}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private renderMemoryTab(stats: FrameStats): string {
    const memory = stats.memory;
    if (!memory) {
      return `<div class="three-lens-inspector-empty">Memory stats not available</div>`;
    }

    // Calculate memory breakdown percentages
    const totalGpu = memory.totalGpuMemory || 1; // Avoid division by zero
    const texturePercent = Math.round((memory.textureMemory / totalGpu) * 100);
    const geometryPercent = Math.round(
      (memory.geometryMemory / totalGpu) * 100
    );
    const rtPercent = Math.round((memory.renderTargetMemory / totalGpu) * 100);

    // Memory thresholds for warnings (in MB)
    const MB = 1024 * 1024;
    const textureWarning = memory.textureMemory > 256 * MB;
    const geometryWarning = memory.geometryMemory > 128 * MB;
    const totalWarning = memory.totalGpuMemory > 512 * MB;

    // Get memory trend (comparing current to average of history)
    const avgHistoryGpu =
      this.memoryHistory.length > 0
        ? this.memoryHistory.reduce((sum, h) => sum + h.totalGpu, 0) /
          this.memoryHistory.length
        : memory.totalGpuMemory;
    const memoryTrend =
      memory.totalGpuMemory > avgHistoryGpu * 1.1
        ? 'rising'
        : memory.totalGpuMemory < avgHistoryGpu * 0.9
          ? 'falling'
          : 'stable';

    return `
      <div class="three-lens-memory-profiler">
        <!-- Total GPU Memory Header -->
        <div class="three-lens-memory-header">
            <div class="three-lens-memory-total">
              <div class="three-lens-memory-total-value ${totalWarning ? 'warning' : ''}">${formatBytes(memory.totalGpuMemory)}</div>
              <div class="three-lens-memory-total-label">Total GPU Memory</div>
          </div>
            <div class="three-lens-memory-trend ${memoryTrend}">
              ${memoryTrend === 'rising' ? '↗ Rising' : memoryTrend === 'falling' ? '↘ Falling' : '→ Stable'}
          </div>
          </div>

          <!-- Memory Breakdown Bar -->
          <div class="three-lens-memory-breakdown">
            <div class="three-lens-memory-breakdown-title">Memory Breakdown</div>
            <div class="three-lens-memory-bar">
              <div class="three-lens-memory-bar-segment texture" style="width: ${texturePercent}%" title="Textures: ${formatBytes(memory.textureMemory)}"></div>
              <div class="three-lens-memory-bar-segment geometry" style="width: ${geometryPercent}%" title="Geometry: ${formatBytes(memory.geometryMemory)}"></div>
              <div class="three-lens-memory-bar-segment render-target" style="width: ${rtPercent}%" title="Render Targets: ${formatBytes(memory.renderTargetMemory)}"></div>
          </div>
            <div class="three-lens-memory-legend">
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color texture"></span>
                <span class="three-lens-memory-legend-label">Textures</span>
                <span class="three-lens-memory-legend-value ${textureWarning ? 'warning' : ''}">${formatBytes(memory.textureMemory)}</span>
        </div>
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color geometry"></span>
                <span class="three-lens-memory-legend-label">Geometry</span>
                <span class="three-lens-memory-legend-value ${geometryWarning ? 'warning' : ''}">${formatBytes(memory.geometryMemory)}</span>
      </div>
              <div class="three-lens-memory-legend-item">
                <span class="three-lens-memory-legend-color render-target"></span>
                <span class="three-lens-memory-legend-label">Render Targets</span>
                <span class="three-lens-memory-legend-value">${formatBytes(memory.renderTargetMemory)}</span>
              </div>
            </div>
          </div>

          <!-- Memory History Chart -->
          ${this.renderMemoryHistoryChart()}

          <!-- Resource Counts -->
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">Resource Counts</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${memory.geometries}</div>
            <div class="three-lens-metric-label">Geometries</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${memory.textures}</div>
            <div class="three-lens-metric-label">Textures</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${memory.programs}</div>
                <div class="three-lens-metric-label">Shaders</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${memory.renderTargets}</div>
            <div class="three-lens-metric-label">RT</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${stats.objectsTotal}</div>
            <div class="three-lens-metric-label">Objects</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${stats.materialsUsed}</div>
            <div class="three-lens-metric-label">Materials</div>
          </div>
        </div>
      </div>

          <!-- Memory Efficiency Analysis -->
          ${this.renderMemoryEfficiency(memory, stats)}
          
          <!-- Memory Per Category Breakdown -->
          ${this.renderMemoryCategoryDetails(memory)}

          <!-- JS Heap (if available) -->
          ${memory.jsHeapSize ? this.renderJsHeapSection(memory.jsHeapSize, memory.jsHeapLimit ?? 0) : ''}
          
          <!-- Memory Tips -->
          ${this.renderMemoryTips(memory, stats)}

        <!-- Memory Warnings -->
        ${this.renderMemoryWarnings(memory, stats)}
            </div>
    `;
  }

  private renderMemoryEfficiency(
    memory: MemoryStats,
    stats: FrameStats
  ): string {
    // Calculate memory efficiency metrics
    const avgMemoryPerObject =
      stats.objectsTotal > 0 ? memory.totalGpuMemory / stats.objectsTotal : 0;
    const avgTextureMemory =
      memory.textures > 0 ? memory.textureMemory / memory.textures : 0;
    const avgGeometryMemory =
      memory.geometries > 0 ? memory.geometryMemory / memory.geometries : 0;

    // Memory efficiency score (0-100)
    const MB = 1024 * 1024;
    let efficiencyScore = 100;
    if (memory.totalGpuMemory > 512 * MB) efficiencyScore -= 30;
    else if (memory.totalGpuMemory > 256 * MB) efficiencyScore -= 15;
    if (avgTextureMemory > 4 * MB) efficiencyScore -= 20;
    else if (avgTextureMemory > 2 * MB) efficiencyScore -= 10;
    if (memory.geometries > 100) efficiencyScore -= 15;
    if (memory.textures > 50) efficiencyScore -= 10;
    efficiencyScore = Math.max(0, efficiencyScore);

    const grade =
      efficiencyScore >= 80
        ? 'A'
        : efficiencyScore >= 60
          ? 'B'
          : efficiencyScore >= 40
            ? 'C'
            : efficiencyScore >= 20
              ? 'D'
              : 'F';
    const gradeColor =
      grade === 'A'
        ? 'var(--3lens-accent-emerald)'
        : grade === 'B'
          ? 'var(--3lens-accent-cyan)'
          : grade === 'C'
            ? 'var(--3lens-accent-amber)'
            : 'var(--3lens-error)';

    return `
      <div class="three-lens-memory-efficiency">
        <div class="three-lens-memory-efficiency-header">
          <div class="three-lens-memory-efficiency-title">Memory Efficiency</div>
          <div class="three-lens-memory-efficiency-grade" style="color: ${gradeColor};">${grade}</div>
            </div>
        <div class="three-lens-memory-efficiency-grid">
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${formatBytes(avgMemoryPerObject)}</div>
            <div class="three-lens-memory-efficiency-label">Avg per Object</div>
          </div>
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${formatBytes(avgTextureMemory)}</div>
            <div class="three-lens-memory-efficiency-label">Avg Texture Size</div>
          </div>
          <div class="three-lens-memory-efficiency-item">
            <div class="three-lens-memory-efficiency-value">${formatBytes(avgGeometryMemory)}</div>
            <div class="three-lens-memory-efficiency-label">Avg Geometry Size</div>
          </div>
        </div>
        <div class="three-lens-memory-efficiency-bar">
          <div class="three-lens-memory-efficiency-fill" style="width: ${efficiencyScore}%; background: ${gradeColor};"></div>
        </div>
        <div class="three-lens-memory-efficiency-score">${efficiencyScore}/100</div>
      </div>
    `;
  }

  private renderMemoryCategoryDetails(memory: MemoryStats): string {
    const KB = 1024;
    const MB = 1024 * KB;

    // Get real texture and geometry data from the probe
    const textures = this.probe.getTextures();
    const geometries = this.probe.getGeometries();

    // Categorize textures by actual size
    let smallTextures = 0;
    let mediumTextures = 0;
    let largeTextures = 0;
    let largestTexture = { name: '', size: 0, dimensions: '' };

    for (const tex of textures) {
      if (tex.estimatedMemoryBytes < 512 * KB) {
        smallTextures++;
      } else if (tex.estimatedMemoryBytes < 2 * MB) {
        mediumTextures++;
      } else {
        largeTextures++;
      }
      if (tex.estimatedMemoryBytes > largestTexture.size) {
        largestTexture = {
          name: tex.name || 'unnamed',
          size: tex.estimatedMemoryBytes,
          dimensions: `${tex.width}×${tex.height}`,
        };
      }
    }

    // If no textures from probe, fall back to estimates
    if (textures.length === 0 && memory.textures > 0) {
      smallTextures = Math.floor(memory.textures * 0.6);
      mediumTextures = Math.floor(memory.textures * 0.3);
      largeTextures = memory.textures - smallTextures - mediumTextures;
    }

    // Categorize geometries by actual vertex count
    let simpleGeos = 0;
    let mediumGeos = 0;
    let complexGeos = 0;
    let largestGeo = { name: '', vertices: 0, faces: 0 };

    for (const geo of geometries) {
      if (geo.vertexCount < 1000) {
        simpleGeos++;
      } else if (geo.vertexCount < 10000) {
        mediumGeos++;
      } else {
        complexGeos++;
      }
      if (geo.vertexCount > largestGeo.vertices) {
        largestGeo = {
          name: geo.name || geo.type,
          vertices: geo.vertexCount,
          faces: geo.faceCount,
        };
      }
    }

    const textureCount = textures.length || memory.textures;
    const geometryCount = geometries.length || memory.geometries;

    return `
      <div class="three-lens-memory-categories">
        <div class="three-lens-memory-categories-title">Memory Distribution</div>
        
        <!-- Texture Size Distribution -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">🖼️</span>
            <span class="three-lens-memory-category-name">Textures</span>
            <span class="three-lens-memory-category-count">${textureCount}</span>
          </div>
          <div class="three-lens-memory-category-bar">
            <div class="three-lens-memory-category-segment small" style="flex: ${smallTextures || 1}" title="Small (<512KB): ${smallTextures}"></div>
            <div class="three-lens-memory-category-segment medium" style="flex: ${mediumTextures || 0}" title="Medium (512KB-2MB): ${mediumTextures}"></div>
            <div class="three-lens-memory-category-segment large" style="flex: ${largeTextures || 0}" title="Large (>2MB): ${largeTextures}"></div>
          </div>
          <div class="three-lens-memory-category-legend">
            <span class="small">● Small (${smallTextures})</span>
            <span class="medium">● Medium (${mediumTextures})</span>
            <span class="large">● Large (${largeTextures})</span>
          </div>
          ${
            largestTexture.size > 0
              ? `
            <div class="three-lens-memory-category-largest">
              Largest: <strong>${largestTexture.name}</strong> (${largestTexture.dimensions}, ${formatBytes(largestTexture.size)})
        </div>
      `
              : ''
          }
        </div>
        
        <!-- Geometry Complexity Distribution -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">📐</span>
            <span class="three-lens-memory-category-name">Geometries</span>
            <span class="three-lens-memory-category-count">${geometryCount}</span>
          </div>
          ${
            geometries.length > 0
              ? `
            <div class="three-lens-memory-category-bar">
              <div class="three-lens-memory-category-segment small" style="flex: ${simpleGeos || 1}" title="Simple (<1K verts): ${simpleGeos}"></div>
              <div class="three-lens-memory-category-segment medium" style="flex: ${mediumGeos || 0}" title="Medium (1K-10K verts): ${mediumGeos}"></div>
              <div class="three-lens-memory-category-segment large" style="flex: ${complexGeos || 0}" title="Complex (>10K verts): ${complexGeos}"></div>
            </div>
            <div class="three-lens-memory-category-legend">
              <span class="small">● Simple (${simpleGeos})</span>
              <span class="medium">● Medium (${mediumGeos})</span>
              <span class="large">● Complex (${complexGeos})</span>
            </div>
            ${
              largestGeo.vertices > 0
                ? `
              <div class="three-lens-memory-category-largest">
                Largest: <strong>${largestGeo.name}</strong> (${formatNumber(largestGeo.vertices)} verts, ${formatNumber(largestGeo.faces)} faces)
              </div>
            `
                : ''
            }
          `
              : `
            <div class="three-lens-memory-category-details">
              <div class="three-lens-memory-category-detail">
                <span class="label">Total Memory</span>
                <span class="value">${formatBytes(memory.geometryMemory)}</span>
              </div>
              <div class="three-lens-memory-category-detail">
                <span class="label">Avg Size</span>
                <span class="value">${formatBytes(memory.geometries > 0 ? memory.geometryMemory / memory.geometries : 0)}</span>
              </div>
            </div>
          `
          }
        </div>
        
        <!-- Programs/Shaders -->
        <div class="three-lens-memory-category">
          <div class="three-lens-memory-category-header">
            <span class="three-lens-memory-category-icon">⚡</span>
            <span class="three-lens-memory-category-name">Shader Programs</span>
            <span class="three-lens-memory-category-count">${memory.programs}</span>
          </div>
          <div class="three-lens-memory-category-note">
            ${memory.programs > 20 ? '⚠️ Many unique shaders may impact performance' : '✓ Reasonable number of shader variants'}
          </div>
        </div>
        
        <!-- Render Targets -->
        ${
          memory.renderTargets > 0
            ? `
          <div class="three-lens-memory-category">
            <div class="three-lens-memory-category-header">
              <span class="three-lens-memory-category-icon">🎯</span>
              <span class="three-lens-memory-category-name">Render Targets</span>
              <span class="three-lens-memory-category-count">${memory.renderTargets}</span>
            </div>
            <div class="three-lens-memory-category-details">
              <div class="three-lens-memory-category-detail">
                <span class="label">Memory</span>
                <span class="value">${formatBytes(memory.renderTargetMemory)}</span>
              </div>
              <div class="three-lens-memory-category-detail">
                <span class="label">Avg Size</span>
                <span class="value">${formatBytes(memory.renderTargets > 0 ? memory.renderTargetMemory / memory.renderTargets : 0)}</span>
              </div>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  private renderMemoryTips(memory: MemoryStats, stats: FrameStats): string {
    const tips: {
      icon: string;
      tip: string;
      priority: 'low' | 'medium' | 'high';
    }[] = [];
    const MB = 1024 * 1024;

    // Generate contextual tips based on current memory state
    if (memory.textureMemory > 128 * MB && memory.textures > 10) {
      tips.push({
        icon: '🗜️',
        tip: 'Use KTX2/Basis texture compression to reduce texture memory by 75%+',
        priority: 'high',
      });
    }

    if (memory.geometries > 50) {
      tips.push({
        icon: '🔗',
        tip: 'Consider merging static geometries with BufferGeometryUtils.mergeBufferGeometries()',
        priority: 'medium',
      });
    }

    if (memory.textures > 30) {
      tips.push({
        icon: '🎨',
        tip: 'Use texture atlases to reduce texture count and draw calls',
        priority: 'medium',
      });
    }

    if (stats.objectsTotal > 1000 && memory.geometryMemory > 64 * MB) {
      tips.push({
        icon: '📏',
        tip: 'Implement LOD (Level of Detail) for distant objects',
        priority: 'high',
      });
    }

    if (memory.programs > 15) {
      tips.push({
        icon: '⚙️',
        tip: 'Reduce shader variants by sharing materials when possible',
        priority: 'low',
      });
    }

    if (memory.renderTargets > 5) {
      tips.push({
        icon: '🎯',
        tip: 'Consolidate post-processing passes to reduce render target memory',
        priority: 'medium',
      });
    }

    // Check for memory growth
    if (this.memoryHistory.length >= 10) {
      const first = this.memoryHistory[0].totalGpu;
      const last = this.memoryHistory[this.memoryHistory.length - 1].totalGpu;
      if (last > first * 1.5) {
        tips.push({
          icon: '🔍',
          tip: 'Memory is growing - check for texture/geometry leaks. Dispose unused resources.',
          priority: 'high',
        });
      }
    }

    if (tips.length === 0) return '';

    // Sort by priority
    tips.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });

    return `
      <div class="three-lens-memory-tips">
        <div class="three-lens-memory-tips-title">💡 Optimization Tips</div>
        <div class="three-lens-memory-tips-list">
          ${tips
            .slice(0, 4)
            .map(
              (t) => `
            <div class="three-lens-memory-tip ${t.priority}">
              <span class="three-lens-memory-tip-icon">${t.icon}</span>
              <span class="three-lens-memory-tip-text">${t.tip}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  private renderMemoryHistoryChart(): string {
    if (this.memoryHistory.length < 2) {
      return `
        <div class="three-lens-memory-chart">
          <div class="three-lens-memory-chart-title">Memory Over Time</div>
          <div class="three-lens-memory-chart-empty">Collecting data...</div>
        </div>
      `;
    }

    // Find max memory for scaling
    const maxMem = Math.max(...this.memoryHistory.map((h) => h.totalGpu), 1);
    const chartHeight = 48;
    const chartWidth = 300;
    const pointSpacing =
      chartWidth / Math.max(this.memoryHistory.length - 1, 1);

    // Build SVG path for memory line
    const points = this.memoryHistory.map((h, i) => {
      const x = i * pointSpacing;
      const y = chartHeight - (h.totalGpu / maxMem) * chartHeight;
      return `${x},${y}`;
    });
    const linePath = `M${points.join(' L')}`;

    // Build area fill path
    const areaPath = `M0,${chartHeight} L${points.join(' L')} L${chartWidth},${chartHeight} Z`;

    return `
      <div class="three-lens-memory-chart">
        <div class="three-lens-memory-chart-header">
          <div class="three-lens-memory-chart-title">Memory Over Time</div>
          <div class="three-lens-memory-chart-max">${formatBytes(maxMem)}</div>
        </div>
        <svg class="three-lens-memory-chart-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: var(--3lens-accent-cyan); stop-opacity: 0.4"/>
              <stop offset="100%" style="stop-color: var(--3lens-accent-cyan); stop-opacity: 0.05"/>
            </linearGradient>
          </defs>
          <path class="three-lens-memory-chart-area" d="${areaPath}" fill="url(#memoryGradient)"/>
          <path class="three-lens-memory-chart-line" d="${linePath}" fill="none" stroke="var(--3lens-accent-cyan)" stroke-width="1.5"/>
        </svg>
        <div class="three-lens-memory-chart-labels">
          <span>60s ago</span>
          <span>Now</span>
        </div>
      </div>
    `;
  }

  private renderJsHeapSection(used: number, limit: number): string {
    const usedPercent = limit > 0 ? Math.round((used / limit) * 100) : 0;
    const isHigh = usedPercent > 80;

    return `
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">JavaScript Heap</div>
        <div class="three-lens-heap-container">
          <div class="three-lens-heap-bar">
            <div class="three-lens-heap-bar-fill ${isHigh ? 'warning' : ''}" style="width: ${usedPercent}%"></div>
          </div>
          <div class="three-lens-heap-stats">
            <span class="three-lens-heap-used ${isHigh ? 'warning' : ''}">${formatBytes(used)}</span>
            <span class="three-lens-heap-separator">/</span>
            <span class="three-lens-heap-limit">${formatBytes(limit)}</span>
            <span class="three-lens-heap-percent ${isHigh ? 'warning' : ''}">(${usedPercent}%)</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderMemoryWarnings(
    memory: MemoryStats,
    _stats: FrameStats
  ): string {
    const warnings: string[] = [];
    const MB = 1024 * 1024;

    // Check for memory issues
    if (memory.textureMemory > 256 * MB) {
      warnings.push(
        `High texture memory: ${formatBytes(memory.textureMemory)}. Consider using compressed textures or reducing texture sizes.`
      );
    }
    if (memory.geometryMemory > 128 * MB) {
      warnings.push(
        `High geometry memory: ${formatBytes(memory.geometryMemory)}. Consider using LOD or geometry instancing.`
      );
    }
    if (memory.totalGpuMemory > 512 * MB) {
      warnings.push(
        `Total GPU memory is high: ${formatBytes(memory.totalGpuMemory)}. May cause performance issues on lower-end devices.`
      );
    }
    if (memory.textures > 50) {
      warnings.push(
        `Many textures loaded (${memory.textures}). Consider using texture atlases.`
      );
    }
    if (memory.geometries > 100) {
      warnings.push(
        `Many geometries (${memory.geometries}). Consider merging static meshes.`
      );
    }

    // Check for memory leaks (continuously rising memory)
    if (this.memoryHistory.length >= 10) {
      const recent = this.memoryHistory.slice(-10);
      const isRising = recent.every(
        (h, i) => i === 0 || h.totalGpu >= recent[i - 1].totalGpu
      );
      if (
        isRising &&
        recent[recent.length - 1].totalGpu > recent[0].totalGpu * 1.2
      ) {
        warnings.push(
          '⚠️ Memory appears to be continuously increasing. Possible memory leak detected.'
        );
      }
    }

    if (warnings.length === 0) return '';

    return `
      <div class="three-lens-memory-warnings">
        <div class="three-lens-memory-warnings-title">⚠ Memory Warnings</div>
        ${warnings.map((w) => `<div class="three-lens-memory-warning">${w}</div>`).join('')}
      </div>
    `;
  }

  private renderRenderingTab(stats: FrameStats): string {
    const rendering = stats.rendering;
    const perf = stats.performance;

    if (!rendering) {
      return `<div class="three-lens-inspector-empty">Rendering stats not available</div>`;
    }

    return `
      <div class="three-lens-rendering-profiler">
        <!-- Render Pipeline Visualization -->
        ${this.renderPipelineVisualization(stats, rendering)}
        
        <!-- Draw Call Efficiency -->
        ${this.renderDrawCallEfficiency(stats, perf)}
        
        <!-- Geometry Statistics -->
      <div class="three-lens-metrics-section">
          <div class="three-lens-metrics-title">Geometry Statistics</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${formatNumber(stats.triangles)}</div>
            <div class="three-lens-metric-label">Triangles</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${formatNumber(stats.vertices)}</div>
            <div class="three-lens-metric-label">Vertices</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${stats.drawCalls}</div>
            <div class="three-lens-metric-label">Draw Calls</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${perf?.trianglesPerDrawCall ?? 0}</div>
            <div class="three-lens-metric-label">Tri/Call</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${stats.points}</div>
            <div class="three-lens-metric-label">Points</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${stats.lines}</div>
            <div class="three-lens-metric-label">Lines</div>
          </div>
        </div>
      </div>
        
        <!-- Object Visibility Breakdown -->
        ${this.renderObjectVisibilityBreakdown(stats, rendering)}
        
        <!-- Lighting Analysis -->
        ${this.renderLightingAnalysis(rendering)}
        
        <!-- Animation & Instancing -->
        ${this.renderAnimationInstancing(rendering)}
        
        <!-- State Changes Analysis -->
        ${this.renderStateChangesAnalysis(rendering)}
        
        ${rendering.xrActive ? this.renderXRInfo(rendering) : ''}
        
        <!-- Rendering Warnings -->
        ${this.renderRenderingWarnings(stats, rendering)}
          </div>
    `;
  }

  private renderPipelineVisualization(
    stats: FrameStats,
    rendering: RenderingStats
  ): string {
    // Calculate estimated time for each stage (simplified estimation)
    const totalTime = stats.cpuTimeMs;
    const shadowTime = rendering.shadowCastingLights * 0.5; // Rough estimate
    const opaqueTime = totalTime * 0.6;
    const transparentTime =
      rendering.transparentObjects > 0 ? totalTime * 0.2 : 0;
    const postProcessTime = rendering.postProcessingPasses * 0.3;

    const stages = [
      {
        name: 'Shadow Pass',
        time: shadowTime,
        color: '#8b5cf6',
        active: rendering.shadowCastingLights > 0,
      },
      { name: 'Opaque', time: opaqueTime, color: '#3b82f6', active: true },
      {
        name: 'Transparent',
        time: transparentTime,
        color: '#22d3ee',
        active: rendering.transparentObjects > 0,
      },
      {
        name: 'Post-Process',
        time: postProcessTime,
        color: '#f59e0b',
        active: rendering.postProcessingPasses > 0,
      },
    ].filter((s) => s.active);

    const totalEstimated = stages.reduce((sum, s) => sum + s.time, 0);

    return `
      <div class="three-lens-pipeline">
        <div class="three-lens-pipeline-header">
          <div class="three-lens-pipeline-title">Render Pipeline</div>
          <div class="three-lens-pipeline-time">${totalTime.toFixed(2)}ms total</div>
          </div>
        <div class="three-lens-pipeline-bar">
          ${stages
            .map((s) => {
              const width =
                totalEstimated > 0 ? (s.time / totalEstimated) * 100 : 0;
              return `<div class="three-lens-pipeline-segment" style="width: ${width}%; background: ${s.color};" title="${s.name}: ~${s.time.toFixed(1)}ms"></div>`;
            })
            .join('')}
          </div>
        <div class="three-lens-pipeline-legend">
          ${stages
            .map(
              (s) => `
            <div class="three-lens-pipeline-legend-item">
              <span class="three-lens-pipeline-legend-color" style="background: ${s.color};"></span>
              <span class="three-lens-pipeline-legend-label">${s.name}</span>
        </div>
          `
            )
            .join('')}
      </div>
          </div>
    `;
  }

  private renderDrawCallEfficiency(
    stats: FrameStats,
    perf: PerformanceMetrics | undefined
  ): string {
    const triPerCall =
      perf?.trianglesPerDrawCall ??
      (stats.drawCalls > 0 ? stats.triangles / stats.drawCalls : 0);
    const efficiency =
      perf?.drawCallEfficiency ?? Math.min(100, triPerCall / 100);

    // Determine efficiency grade
    let grade = 'A';
    let gradeColor = 'var(--3lens-accent-emerald)';
    if (efficiency < 25) {
      grade = 'F';
      gradeColor = 'var(--3lens-error)';
    } else if (efficiency < 50) {
      grade = 'D';
      gradeColor = 'var(--3lens-warning)';
    } else if (efficiency < 65) {
      grade = 'C';
      gradeColor = 'var(--3lens-accent-amber)';
    } else if (efficiency < 80) {
      grade = 'B';
      gradeColor = 'var(--3lens-accent-cyan)';
    }

    // Draw call history chart
    const historyChart =
      this.drawCallHistory.length > 5
        ? this.renderMiniChart(this.drawCallHistory, 'var(--3lens-accent-blue)')
        : '';

    return `
      <div class="three-lens-efficiency">
        <div class="three-lens-efficiency-header">
          <div class="three-lens-efficiency-title">Draw Call Efficiency</div>
          <div class="three-lens-efficiency-grade" style="color: ${gradeColor};">${grade}</div>
          </div>
        <div class="three-lens-efficiency-content">
          <div class="three-lens-efficiency-meter">
            <div class="three-lens-efficiency-bar">
              <div class="three-lens-efficiency-fill" style="width: ${Math.min(100, efficiency)}%; background: ${gradeColor};"></div>
          </div>
            <div class="three-lens-efficiency-value">${efficiency.toFixed(0)}%</div>
        </div>
          <div class="three-lens-efficiency-stats">
            <div class="three-lens-efficiency-stat">
              <span class="three-lens-efficiency-stat-value">${formatNumber(Math.round(triPerCall))}</span>
              <span class="three-lens-efficiency-stat-label">Triangles/Call</span>
      </div>
            <div class="three-lens-efficiency-stat">
              <span class="three-lens-efficiency-stat-value">${stats.drawCalls}</span>
              <span class="three-lens-efficiency-stat-label">Total Calls</span>
          </div>
          </div>
          </div>
        ${
          historyChart
            ? `
          <div class="three-lens-efficiency-history">
            <div class="three-lens-efficiency-history-title">Draw Calls Over Time</div>
            ${historyChart}
        </div>
        `
            : ''
        }
      </div>
    `;
  }

  private renderMiniChart(data: number[], color: string): string {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const height = 32;
    const width = 200;
    const pointSpacing = width / Math.max(data.length - 1, 1);

    const points = data.map((v, i) => {
      const x = i * pointSpacing;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    });

    const linePath = `M${points.join(' L')}`;
    const areaPath = `M0,${height} L${points.join(' L')} L${width},${height} Z`;

    return `
      <svg class="three-lens-mini-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="miniChartGradient-${color.replace('#', '')}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: ${color}; stop-opacity: 0.3"/>
            <stop offset="100%" style="stop-color: ${color}; stop-opacity: 0.05"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#miniChartGradient-${color.replace('#', '')})"/>
        <path d="${linePath}" fill="none" stroke="${color}" stroke-width="1.5"/>
      </svg>
    `;
  }

  private renderObjectVisibilityBreakdown(
    stats: FrameStats,
    rendering: RenderingStats
  ): string {
    const total = stats.objectsTotal || 1;
    const visible = stats.objectsVisible;
    const culled = stats.objectsCulled;
    const transparent = rendering.transparentObjects;
    const opaque = visible - transparent;

    const visiblePercent = (visible / total) * 100;
    const culledPercent = (culled / total) * 100;

    return `
      <div class="three-lens-visibility-breakdown">
        <div class="three-lens-visibility-title">Object Visibility</div>
        <div class="three-lens-visibility-bar">
          <div class="three-lens-visibility-segment visible" style="width: ${visiblePercent}%;" title="Visible: ${visible}"></div>
          <div class="three-lens-visibility-segment culled" style="width: ${culledPercent}%;" title="Culled: ${culled}"></div>
          </div>
        <div class="three-lens-visibility-stats">
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot visible"></span>
            <span class="three-lens-visibility-label">Visible</span>
            <span class="three-lens-visibility-value">${visible}</span>
          </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot culled"></span>
            <span class="three-lens-visibility-label">Culled</span>
            <span class="three-lens-visibility-value">${culled}</span>
          </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot transparent"></span>
            <span class="three-lens-visibility-label">Transparent</span>
            <span class="three-lens-visibility-value">${transparent}</span>
        </div>
          <div class="three-lens-visibility-stat">
            <span class="three-lens-visibility-dot opaque"></span>
            <span class="three-lens-visibility-label">Opaque</span>
            <span class="three-lens-visibility-value">${opaque}</span>
      </div>
            </div>
            </div>
    `;
  }

  private renderLightingAnalysis(rendering: RenderingStats): string {
    const _hasLights = rendering.totalLights > 0;
    const _hasShadows = rendering.shadowCastingLights > 0;

    // Calculate shadow cost estimate (rough)
    const shadowCost = rendering.shadowCastingLights * 2; // Assume 2ms per shadow light
    const isShadowCostHigh = shadowCost > 4;

    return `
      <div class="three-lens-lighting">
        <div class="three-lens-lighting-title">Lighting & Shadows</div>
        <div class="three-lens-lighting-grid">
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">💡</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${rendering.totalLights}</div>
              <div class="three-lens-lighting-label">Total Lights</div>
          </div>
        </div>
          <div class="three-lens-lighting-item ${isShadowCostHigh ? 'warning' : ''}">
            <div class="three-lens-lighting-icon">🌓</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${rendering.shadowCastingLights}</div>
              <div class="three-lens-lighting-label">Shadow Casters</div>
            </div>
          </div>
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">🔄</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${rendering.shadowMapUpdates}</div>
              <div class="three-lens-lighting-label">Shadow Updates</div>
            </div>
          </div>
          <div class="three-lens-lighting-item">
            <div class="three-lens-lighting-icon">👁️</div>
            <div class="three-lens-lighting-info">
              <div class="three-lens-lighting-value">${rendering.activeLights}</div>
              <div class="three-lens-lighting-label">Active Lights</div>
            </div>
          </div>
        </div>
        ${
          isShadowCostHigh
            ? `
          <div class="three-lens-lighting-warning">
            ⚠️ High shadow cost (~${shadowCost.toFixed(0)}ms). Consider reducing shadow-casting lights.
        </div>
      `
            : ''
        }
      </div>
    `;
  }

  private renderAnimationInstancing(rendering: RenderingStats): string {
    const hasAnimation =
      rendering.skinnedMeshes > 0 || rendering.totalBones > 0;
    const hasInstancing =
      rendering.instancedDrawCalls > 0 || rendering.totalInstances > 0;

    if (!hasAnimation && !hasInstancing) {
      return `
        <div class="three-lens-animation">
          <div class="three-lens-animation-title">Animation & Instancing</div>
          <div class="three-lens-animation-empty">No skinned meshes or instances detected</div>
        </div>
      `;
    }

    return `
      <div class="three-lens-animation">
        <div class="three-lens-animation-title">Animation & Instancing</div>
        <div class="three-lens-animation-grid">
          ${
            hasAnimation
              ? `
            <div class="three-lens-animation-section">
              <div class="three-lens-animation-section-title">Skinned Meshes</div>
              <div class="three-lens-animation-stats">
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${rendering.skinnedMeshes}</span>
                  <span class="three-lens-animation-stat-label">Meshes</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${rendering.totalBones}</span>
                  <span class="three-lens-animation-stat-label">Bones</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${rendering.skinnedMeshes > 0 ? Math.round(rendering.totalBones / rendering.skinnedMeshes) : 0}</span>
                  <span class="three-lens-animation-stat-label">Avg/Mesh</span>
                </div>
              </div>
            </div>
          `
              : ''
          }
          ${
            hasInstancing
              ? `
            <div class="three-lens-animation-section">
              <div class="three-lens-animation-section-title">Instancing</div>
              <div class="three-lens-animation-stats">
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${rendering.instancedDrawCalls}</span>
                  <span class="three-lens-animation-stat-label">Draw Calls</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${formatNumber(rendering.totalInstances)}</span>
                  <span class="three-lens-animation-stat-label">Instances</span>
                </div>
                <div class="three-lens-animation-stat">
                  <span class="three-lens-animation-stat-value">${rendering.instancedDrawCalls > 0 ? Math.round(rendering.totalInstances / rendering.instancedDrawCalls) : 0}</span>
                  <span class="three-lens-animation-stat-label">Avg/Call</span>
                </div>
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  private renderStateChangesAnalysis(rendering: RenderingStats): string {
    const totalStateChanges =
      rendering.programSwitches +
      rendering.textureBinds +
      rendering.renderTargetSwitches;
    const isHigh = totalStateChanges > 200;

    return `
      <div class="three-lens-state-changes">
        <div class="three-lens-state-changes-header">
          <div class="three-lens-state-changes-title">State Changes</div>
          <div class="three-lens-state-changes-total ${isHigh ? 'warning' : ''}">${totalStateChanges} total</div>
        </div>
        <div class="three-lens-state-changes-grid">
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill program" style="width: ${Math.min(100, rendering.programSwitches / 2)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Shader Switches</span>
              <span class="three-lens-state-change-value">${rendering.programSwitches}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill texture" style="width: ${Math.min(100, rendering.textureBinds / 5)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Texture Binds</span>
              <span class="three-lens-state-change-value">${rendering.textureBinds}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill rt" style="width: ${Math.min(100, rendering.renderTargetSwitches * 10)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">RT Switches</span>
              <span class="three-lens-state-change-value">${rendering.renderTargetSwitches}</span>
            </div>
          </div>
          <div class="three-lens-state-change-item">
            <div class="three-lens-state-change-bar">
              <div class="three-lens-state-change-fill upload" style="width: ${Math.min(100, rendering.bufferUploads * 5)}%;"></div>
            </div>
            <div class="three-lens-state-change-info">
              <span class="three-lens-state-change-label">Buffer Uploads</span>
              <span class="three-lens-state-change-value">${rendering.bufferUploads}</span>
            </div>
          </div>
        </div>
        ${
          rendering.bytesUploaded > 0
            ? `
          <div class="three-lens-state-changes-upload">
            Data uploaded: ${formatBytes(rendering.bytesUploaded)}/frame
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  private renderXRInfo(rendering: RenderingStats): string {
    return `
      <div class="three-lens-xr">
        <div class="three-lens-xr-header">
          <div class="three-lens-xr-title">🥽 XR Mode Active</div>
          <div class="three-lens-xr-badge">VR</div>
        </div>
        <div class="three-lens-xr-stats">
          <div class="three-lens-xr-stat">
            <span class="three-lens-xr-stat-value">${rendering.viewports}</span>
            <span class="three-lens-xr-stat-label">Viewports</span>
          </div>
          <div class="three-lens-xr-stat">
            <span class="three-lens-xr-stat-value">×${rendering.viewports}</span>
            <span class="three-lens-xr-stat-label">Draw Cost</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderRenderingWarnings(
    stats: FrameStats,
    rendering: RenderingStats
  ): string {
    const warnings: string[] = [];

    if (
      stats.drawCalls > 500 &&
      stats.performance?.trianglesPerDrawCall &&
      stats.performance.trianglesPerDrawCall < 500
    ) {
      warnings.push(
        'Low triangles per draw call. Consider batching or using instancing.'
      );
    }
    if (rendering.transparentObjects > 50) {
      warnings.push(
        `${rendering.transparentObjects} transparent objects may cause overdraw issues.`
      );
    }
    if (rendering.shadowCastingLights > 4) {
      warnings.push(
        'Many shadow-casting lights. Consider using fewer or baked shadows.'
      );
    }
    if (rendering.renderTargetSwitches > 10) {
      warnings.push(
        'High render target switches. Consider consolidating post-processing passes.'
      );
    }

    if (warnings.length === 0) return '';

    return `
      <div class="three-lens-rendering-warnings">
        <div class="three-lens-rendering-warnings-title">⚠ Rendering Warnings</div>
        ${warnings.map((w) => `<div class="three-lens-rendering-warning">${w}</div>`).join('')}
      </div>
    `;
  }

  private renderTimelineTab(_stats: FrameStats): string {
    const hasGpuData = this.gpuHistory.length > 0;
    const visibleFrameCount = this.getTimelineVisibleFrameCount();
    const spikeThreshold = 33.33; // 30 FPS threshold (2x 60fps budget)
    const hasRecording = this.recordedFrames.length > 0;
    const recordingDuration = hasRecording
      ? (
          (this.recordedFrames[this.recordedFrames.length - 1].timestamp -
            this.recordedFrames[0].timestamp) /
          1000
        ).toFixed(1)
      : '0';

    // Detect spikes in current view (live or recorded)
    const spikes = this.detectSpikes(spikeThreshold);

    return `
      <div class="three-lens-timeline-container">
        <div class="three-lens-timeline-controls">
          <div class="three-lens-timeline-left-controls">
            <button class="three-lens-timeline-record-btn ${this.isRecording ? 'recording' : ''}" id="three-lens-timeline-record" title="${this.isRecording ? 'Stop Recording' : 'Start Recording'}">
              ${this.isRecording ? '⏹' : '⏺'}
            </button>
            ${
              hasRecording
                ? `
              <button class="three-lens-timeline-btn" id="three-lens-timeline-clear" title="Clear Recording">🗑</button>
              <span class="three-lens-timeline-recording-info">${this.recordedFrames.length}f / ${recordingDuration}s</span>
            `
                : ''
            }
            <div class="three-lens-timeline-divider"></div>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-zoom-out" title="Zoom Out">−</button>
            <span class="three-lens-timeline-zoom-label" id="three-lens-timeline-zoom-label">${visibleFrameCount}f</span>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-zoom-in" title="Zoom In">+</button>
            <button class="three-lens-timeline-btn" id="three-lens-timeline-reset" title="Reset View">↺</button>
          </div>
          <div class="three-lens-timeline-right-controls">
            <span class="three-lens-timeline-stat">
              <span class="three-lens-timeline-stat-label">Spikes:</span>
              <span class="three-lens-timeline-stat-value ${spikes.length > 0 ? 'warning' : ''}">${spikes.length}</span>
            </span>
            <select class="three-lens-timeline-buffer-select" id="three-lens-timeline-buffer-size" title="Buffer size">
              <option value="120" ${this.frameBufferSize === 120 ? 'selected' : ''}>2s</option>
              <option value="300" ${this.frameBufferSize === 300 ? 'selected' : ''}>5s</option>
              <option value="600" ${this.frameBufferSize === 600 ? 'selected' : ''}>10s</option>
            </select>
          </div>
        </div>
        
        <div class="three-lens-timeline-chart-container" id="three-lens-timeline-chart-container">
          <canvas id="three-lens-timeline-chart" class="three-lens-timeline-chart"></canvas>
          <div class="three-lens-timeline-tooltip" id="three-lens-timeline-tooltip"></div>
        </div>
        
        <div class="three-lens-timeline-legend">
          <div class="three-lens-timeline-legend-item">
            <span class="three-lens-timeline-legend-color cpu"></span>
            <span>CPU</span>
          </div>
          ${
            hasGpuData
              ? `
            <div class="three-lens-timeline-legend-item">
              <span class="three-lens-timeline-legend-color gpu"></span>
              <span>GPU</span>
            </div>
          `
              : ''
          }
          <div class="three-lens-timeline-legend-item">
            <span class="three-lens-timeline-legend-color spike"></span>
            <span>Spike</span>
          </div>
        </div>
        
        ${this.timelineSelectedFrame !== null ? this.renderTimelineFrameDetails(this.timelineSelectedFrame) : ''}
      </div>
    `;
  }

  private renderTimelineFrameDetails(frameIndex: number): string {
    const cpuTime = this.frameHistory[frameIndex] ?? 0;
    const gpuTime = this.gpuHistory[frameIndex];
    const fps = cpuTime > 0 ? 1000 / cpuTime : 0;
    const perfEntry = this.performanceHistory[frameIndex];

    return `
      <div class="three-lens-timeline-frame-details">
        <div class="three-lens-timeline-frame-details-header">
          <span>Frame #${frameIndex + 1}</span>
          <button class="three-lens-timeline-close-btn" id="three-lens-timeline-close-details">×</button>
        </div>
        <div class="three-lens-timeline-frame-details-grid">
          <div class="three-lens-timeline-frame-detail">
            <span class="three-lens-timeline-frame-detail-label">CPU Time</span>
            <span class="three-lens-timeline-frame-detail-value ${cpuTime > 16.67 ? 'warning' : ''}">${cpuTime.toFixed(2)}ms</span>
          </div>
          ${
            gpuTime !== undefined
              ? `
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">GPU Time</span>
              <span class="three-lens-timeline-frame-detail-value ${gpuTime > 16.67 ? 'warning' : ''}">${gpuTime.toFixed(2)}ms</span>
            </div>
          `
              : ''
          }
          <div class="three-lens-timeline-frame-detail">
            <span class="three-lens-timeline-frame-detail-label">FPS</span>
            <span class="three-lens-timeline-frame-detail-value ${fps < 30 ? 'error' : fps < 55 ? 'warning' : ''}">${fps.toFixed(1)}</span>
          </div>
          ${
            perfEntry
              ? `
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">Draw Calls</span>
              <span class="three-lens-timeline-frame-detail-value">${perfEntry.drawCalls}</span>
            </div>
            <div class="three-lens-timeline-frame-detail">
              <span class="three-lens-timeline-frame-detail-label">Triangles</span>
              <span class="three-lens-timeline-frame-detail-value">${formatNumber(perfEntry.triangles)}</span>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
  }

  private getTimelineVisibleFrameCount(): number {
    return Math.max(
      10,
      Math.min(
        this.maxHistoryLength,
        Math.floor(this.maxHistoryLength / this.timelineZoom)
      )
    );
  }

  private detectSpikes(threshold: number): number[] {
    const spikes: number[] = [];
    for (let i = 0; i < this.frameHistory.length; i++) {
      const cpuTime = this.frameHistory[i];
      const gpuTime = this.gpuHistory[i];
      const totalTime = cpuTime + (gpuTime ?? 0);
      if (totalTime > threshold) {
        spikes.push(i);
      }
    }
    return spikes;
  }

  // ═══════════════════════════════════════════════════════════════
  // RESOURCES TAB (Lifecycle Tracking)
  // ═══════════════════════════════════════════════════════════════

  private renderResourcesTab(): string {
    const summary = this.probe.getResourceLifecycleSummary();
    const events = this.probe.getResourceEvents();
    const potentialLeaks = this.probe.getPotentialResourceLeaks();
    const orphanedResources = this.probe.getOrphanedResources();
    const leakAlerts = this.probe.getLeakAlerts();
    const stackTracesEnabled = this.probe.isResourceStackTraceCaptureEnabled();
    const estimatedMemory = this.probe.getEstimatedResourceMemory();

    // Get recent events (last 50)
    const recentEvents = events.slice(-50).reverse();

    return `
      <div class="three-lens-resources-profiler">
        ${this.renderResourceSummary(summary)}
        ${this.renderLeakDetectionControls(stackTracesEnabled)}
        ${this.renderMemoryUsage(estimatedMemory)}
        ${leakAlerts.length > 0 ? this.renderLeakAlerts(leakAlerts) : ''}
        ${orphanedResources.length > 0 ? this.renderOrphanedResources(orphanedResources) : ''}
        ${potentialLeaks.length > 0 ? this.renderPotentialLeaks(potentialLeaks) : ''}
        ${this.renderResourceTimeline(recentEvents)}
        ${this.renderResourceEventList(recentEvents)}
      </div>
    `;
  }

  private renderResourceSummary(summary: ResourceLifecycleSummary): string {
    return `
      <div class="three-lens-resource-summary">
        <div class="three-lens-resource-summary-title">Resource Lifecycle Summary</div>
        <div class="three-lens-resource-summary-grid">
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon geometry">📐</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Geometries</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${summary.geometries.created} created</span>
                <span class="disposed">${summary.geometries.disposed} disposed</span>
                <span class="active ${summary.geometries.active > 0 ? 'highlight' : ''}">${summary.geometries.active} active</span>
                ${summary.geometries.leaked > 0 ? `<span class="leaked">⚠ ${summary.geometries.leaked} leaked?</span>` : ''}
              </div>
            </div>
          </div>
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon material">🎨</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Materials</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${summary.materials.created} created</span>
                <span class="disposed">${summary.materials.disposed} disposed</span>
                <span class="active ${summary.materials.active > 0 ? 'highlight' : ''}">${summary.materials.active} active</span>
                ${summary.materials.leaked > 0 ? `<span class="leaked">⚠ ${summary.materials.leaked} leaked?</span>` : ''}
              </div>
            </div>
          </div>
          <div class="three-lens-resource-summary-item">
            <div class="three-lens-resource-summary-icon texture">🖼</div>
            <div class="three-lens-resource-summary-details">
              <div class="three-lens-resource-summary-label">Textures</div>
              <div class="three-lens-resource-summary-stats">
                <span class="created">${summary.textures.created} created</span>
                <span class="disposed">${summary.textures.disposed} disposed</span>
                <span class="active ${summary.textures.active > 0 ? 'highlight' : ''}">${summary.textures.active} active</span>
                ${summary.textures.leaked > 0 ? `<span class="leaked">⚠ ${summary.textures.leaked} leaked?</span>` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="three-lens-resource-total-events">${summary.totalEvents} total events tracked</div>
      </div>
    `;
  }

  private renderLeakDetectionControls(stackTracesEnabled: boolean): string {
    return `
      <div class="three-lens-resource-controls">
        <div class="three-lens-leak-controls-left">
          <button class="three-lens-action-btn" data-action="run-leak-detection" title="Run leak detection checks">
            🔍 Detect Leaks
          </button>
          <button class="three-lens-action-btn" data-action="generate-leak-report" title="Generate detailed leak report">
            📋 Report
          </button>
        </div>
        <div class="three-lens-leak-controls-right">
          <div class="three-lens-toggle-row compact" data-action="toggle-stack-traces">
            <span class="three-lens-toggle-label">Stacks</span>
            <button class="three-lens-toggle-btn ${stackTracesEnabled ? 'active' : ''}" title="Capture stack traces (performance impact)">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
          <button class="three-lens-action-btn small" data-action="clear-resource-events" title="Clear">
            🗑
          </button>
        </div>
      </div>
    `;
  }

  private renderMemoryUsage(estimatedBytes: number): string {
    const memoryHistory = this.probe.getResourceMemoryHistory();
    const hasHistory = memoryHistory.length > 1;

    let trend = '';
    let trendClass = '';
    if (hasHistory) {
      const first = memoryHistory[0].estimatedBytes;
      const last = memoryHistory[memoryHistory.length - 1].estimatedBytes;
      const diff = last - first;
      if (diff > 1024 * 1024) {
        // > 1MB growth
        trend = `↑ +${formatBytes(diff)}`;
        trendClass = 'growing';
      } else if (diff < -1024 * 1024) {
        // > 1MB decrease
        trend = `↓ ${formatBytes(Math.abs(diff))}`;
        trendClass = 'shrinking';
      } else {
        trend = '→ stable';
        trendClass = 'stable';
      }
    }

    return `
      <div class="three-lens-memory-usage">
        <div class="three-lens-memory-usage-header">
          <span class="three-lens-memory-usage-label">Resource Memory</span>
          <span class="three-lens-memory-usage-value">${formatBytes(estimatedBytes)}</span>
          ${trend ? `<span class="three-lens-memory-trend ${trendClass}">${trend}</span>` : ''}
        </div>
      </div>
    `;
  }

  private renderLeakAlerts(alerts: LeakAlert[]): string {
    const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
    const warningAlerts = alerts.filter((a) => a.severity === 'warning');

    return `
      <div class="three-lens-leak-alerts">
        <div class="three-lens-leak-alerts-header">
          <span class="three-lens-leak-alerts-icon">🚨</span>
          <span>Leak Alerts (${alerts.length})</span>
          ${criticalAlerts.length > 0 ? `<span class="three-lens-alert-badge critical">${criticalAlerts.length} critical</span>` : ''}
          ${warningAlerts.length > 0 ? `<span class="three-lens-alert-badge warning">${warningAlerts.length} warning</span>` : ''}
          <button class="three-lens-action-btn small" data-action="clear-leak-alerts" title="Clear alerts">✕</button>
        </div>
        <div class="three-lens-leak-alerts-list">
          ${alerts
            .slice(0, 5)
            .map(
              (alert) => `
            <div class="three-lens-leak-alert-item ${alert.severity}">
              <span class="three-lens-alert-severity ${alert.severity}">${this.getSeverityIcon(alert.severity)}</span>
              <div class="three-lens-alert-content">
                <div class="three-lens-alert-message">${alert.message}</div>
                <div class="three-lens-alert-details">${alert.details}</div>
                <div class="three-lens-alert-suggestion">💡 ${alert.suggestion}</div>
              </div>
            </div>
          `
            )
            .join('')}
          ${alerts.length > 5 ? `<div class="three-lens-leak-more">+ ${alerts.length - 5} more alerts...</div>` : ''}
        </div>
      </div>
    `;
  }

  private renderOrphanedResources(
    orphans: Array<{
      type: ResourceType;
      uuid: string;
      name?: string;
      subtype?: string;
      ageMs: number;
    }>
  ): string {
    return `
      <div class="three-lens-orphaned-resources">
        <div class="three-lens-orphaned-header">
          <span class="three-lens-orphaned-icon">👻</span>
          <span>Orphaned Resources (${orphans.length})</span>
        </div>
        <div class="three-lens-orphaned-hint">Not attached to any mesh - consider disposing</div>
        <div class="three-lens-orphaned-list">
          ${orphans
            .slice(0, 5)
            .map(
              (orphan) => `
            <div class="three-lens-orphan-item">
              <span class="three-lens-orphan-type ${orphan.type}">${this.getResourceIcon(orphan.type)}</span>
              <span class="three-lens-orphan-name">${orphan.name || orphan.subtype || orphan.uuid.substring(0, 8)}</span>
              <span class="three-lens-orphan-age">${this.formatAge(orphan.ageMs)}</span>
            </div>
          `
            )
            .join('')}
          ${orphans.length > 5 ? `<div class="three-lens-orphan-more">+ ${orphans.length - 5} more...</div>` : ''}
        </div>
      </div>
    `;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return '🔵';
      default:
        return '⚪';
    }
  }

  private renderPotentialLeaks(
    leaks: Array<{
      type: ResourceType;
      uuid: string;
      name?: string;
      subtype?: string;
      ageMs: number;
    }>
  ): string {
    return `
      <div class="three-lens-potential-leaks">
        <div class="three-lens-potential-leaks-header">
          <span class="three-lens-potential-leaks-icon">⚠</span>
          <span>Potential Memory Leaks (${leaks.length})</span>
        </div>
        <div class="three-lens-potential-leaks-list">
          ${leaks
            .slice(0, 5)
            .map(
              (leak) => `
            <div class="three-lens-leak-item">
              <span class="three-lens-leak-type ${leak.type}">${this.getResourceIcon(leak.type)}</span>
              <span class="three-lens-leak-name">${leak.name || leak.subtype || leak.uuid.substring(0, 8)}</span>
              <span class="three-lens-leak-age">${this.formatAge(leak.ageMs)}</span>
            </div>
          `
            )
            .join('')}
          ${leaks.length > 5 ? `<div class="three-lens-leak-more">+ ${leaks.length - 5} more...</div>` : ''}
        </div>
      </div>
    `;
  }

  private renderResourceTimeline(events: ResourceLifecycleEvent[]): string {
    if (events.length === 0) {
      return `<div class="three-lens-resource-timeline-empty">No resource events recorded yet</div>`;
    }

    // Group events into time buckets for visualization
    const now = performance.now();
    const timeWindowMs = 60000; // Last 60 seconds
    const bucketCount = 30;
    const bucketSizeMs = timeWindowMs / bucketCount;

    const buckets: Array<{
      geometry: number;
      material: number;
      texture: number;
      disposed: number;
    }> = [];
    for (let i = 0; i < bucketCount; i++) {
      buckets.push({ geometry: 0, material: 0, texture: 0, disposed: 0 });
    }

    for (const event of events) {
      const age = now - event.timestamp;
      if (age > timeWindowMs) continue;

      const bucketIndex = Math.floor((timeWindowMs - age) / bucketSizeMs);
      if (bucketIndex >= 0 && bucketIndex < bucketCount) {
        if (event.eventType === 'disposed') {
          buckets[bucketIndex].disposed++;
        } else if (event.eventType === 'created') {
          const resType = event.resourceType as
            | 'geometry'
            | 'material'
            | 'texture';
          if (resType in buckets[bucketIndex]) {
            buckets[bucketIndex][resType]++;
          }
        }
      }
    }

    const maxValue = Math.max(
      1,
      ...buckets.map((b) => b.geometry + b.material + b.texture + b.disposed)
    );

    return `
      <div class="three-lens-resource-timeline">
        <div class="three-lens-resource-timeline-header">
          <span>Event Timeline (last 60s)</span>
          <div class="three-lens-resource-timeline-legend">
            <span class="geometry">📐 Geo</span>
            <span class="material">🎨 Mat</span>
            <span class="texture">🖼 Tex</span>
            <span class="disposed">✕ Disposed</span>
          </div>
        </div>
        <div class="three-lens-resource-timeline-chart">
          ${buckets
            .map((bucket, _i) => {
              const totalHeight =
                ((bucket.geometry +
                  bucket.material +
                  bucket.texture +
                  bucket.disposed) /
                  maxValue) *
                100;
              const geoHeight = (bucket.geometry / maxValue) * 100;
              const matHeight = (bucket.material / maxValue) * 100;
              const texHeight = (bucket.texture / maxValue) * 100;
              const dispHeight = (bucket.disposed / maxValue) * 100;

              return `
              <div class="three-lens-resource-timeline-bar" title="${bucket.geometry + bucket.material + bucket.texture} created, ${bucket.disposed} disposed">
                <div class="three-lens-resource-bar-stack" style="height: ${totalHeight}%">
                  ${geoHeight > 0 ? `<div class="three-lens-resource-bar-segment geometry" style="height: ${(geoHeight / totalHeight) * 100}%"></div>` : ''}
                  ${matHeight > 0 ? `<div class="three-lens-resource-bar-segment material" style="height: ${(matHeight / totalHeight) * 100}%"></div>` : ''}
                  ${texHeight > 0 ? `<div class="three-lens-resource-bar-segment texture" style="height: ${(texHeight / totalHeight) * 100}%"></div>` : ''}
                  ${dispHeight > 0 ? `<div class="three-lens-resource-bar-segment disposed" style="height: ${(dispHeight / totalHeight) * 100}%"></div>` : ''}
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
        <div class="three-lens-resource-timeline-labels">
          <span>60s ago</span>
          <span>now</span>
        </div>
      </div>
    `;
  }

  private renderResourceEventList(events: ResourceLifecycleEvent[]): string {
    if (events.length === 0) {
      return '';
    }

    return `
      <div class="three-lens-resource-event-list">
        <div class="three-lens-resource-event-list-header">Recent Events</div>
        <div class="three-lens-resource-event-list-items">
          ${events
            .slice(0, 20)
            .map(
              (event) => `
            <div class="three-lens-resource-event-item ${event.eventType}">
              <span class="three-lens-resource-event-type ${event.resourceType}">${this.getResourceIcon(event.resourceType)}</span>
              <span class="three-lens-resource-event-action ${event.eventType}">${this.getEventTypeLabel(event.eventType)}</span>
              <span class="three-lens-resource-event-name">${event.resourceName || event.resourceSubtype || event.resourceUuid.substring(0, 8)}</span>
              ${event.metadata?.textureSlot ? `<span class="three-lens-resource-event-slot">[${event.metadata.textureSlot}]</span>` : ''}
              <span class="three-lens-resource-event-time">${this.formatEventTime(event.timestamp)}</span>
            </div>
          `
            )
            .join('')}
        </div>
        ${events.length > 20 ? `<div class="three-lens-resource-event-more">${events.length - 20} more events...</div>` : ''}
      </div>
    `;
  }

  private getResourceIcon(type: string): string {
    switch (type) {
      case 'geometry':
        return '📐';
      case 'material':
        return '🎨';
      case 'texture':
        return '🖼';
      default:
        return '📦';
    }
  }

  private getEventTypeLabel(eventType: string): string {
    switch (eventType) {
      case 'created':
        return '+';
      case 'disposed':
        return '✕';
      case 'attached':
        return '→';
      case 'detached':
        return '←';
      default:
        return '?';
    }
  }

  private formatAge(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  private formatEventTime(timestamp: number): string {
    const age = performance.now() - timestamp;
    if (age < 1000) return 'now';
    if (age < 60000) return `${Math.round(age / 1000)}s ago`;
    if (age < 3600000) return `${Math.round(age / 60000)}m ago`;
    return `${Math.round(age / 3600000)}h ago`;
  }

  private findNodeById(nodes: SceneNode[], id: string): SceneNode | null {
    for (const node of nodes) {
      if (node.ref.debugId === id) return node;
      const found = this.findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
  }

  private renderNodeInspector(node: SceneNode): string {
    const t = node.transform;
    const toDeg = (r: number) => ((r * 180) / Math.PI).toFixed(2);

    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Transform</div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Position</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${t.position.x.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.position.y.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.position.z.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Rotation</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${toDeg(t.rotation.x)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${toDeg(t.rotation.y)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${toDeg(t.rotation.z)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
        <div class="three-lens-property-row">
          <span class="three-lens-property-name">Scale</span>
          <div class="three-lens-vector-inputs">
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.x.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">X</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.y.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Y</div></div>
            <div class="three-lens-vector-input"><input type="number" value="${t.scale.z.toFixed(2)}" step="0.1" readonly><div class="three-lens-vector-label">Z</div></div>
          </div>
        </div>
      </div>
      ${node.meshData ? this.renderMeshInfo(node.meshData) : ''}
      ${node.lightData ? this.renderLightInfo(node.lightData) : ''}
      ${node.cameraData ? this.renderCameraInfo(node.cameraData) : ''}
      ${this.renderVisualOverlaysSection(node)}
      ${this.renderCameraControlsSection(node)}
      <div class="three-lens-section">
        <div class="three-lens-section-header">Rendering</div>
        ${this.renderProp('Layers', this.formatLayers(node.layers))}
        ${this.renderProp('Render Order', node.renderOrder)}
        ${this.renderProp('Frustum Culled', node.frustumCulled)}
        ${this.renderProp('Children', node.children.length)}
      </div>
    `;
  }

  private renderGlobalTools(): string {
    const globalWireframe = this.probe.isGlobalWireframeEnabled();
    const cameraInfo = this.probe.getCameraInfo();
    const hasHome = this.probe.hasHomePosition();
    const availableCameras = this.probe.getAvailableCameras();

    // Collect and sort objects by cost
    const costRanking = this.collectCostRanking();

    return `
      <div class="three-lens-global-tools">
        <div class="three-lens-global-tools-header">
          <span class="three-lens-global-icon">🌐</span>
          <span>Global Tools</span>
        </div>
        <div class="three-lens-section">
          <div class="three-lens-section-header">Visual Settings</div>
          <div class="three-lens-toggle-row global" data-action="toggle-global-wireframe">
            <span class="three-lens-toggle-label">Global Wireframe</span>
            <button class="three-lens-toggle-btn ${globalWireframe ? 'active' : ''}" title="Toggle wireframe for all meshes">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>
        <div class="three-lens-section">
          <div class="three-lens-section-header">Camera</div>
          ${
            cameraInfo
              ? `
            <div class="three-lens-camera-info">
              <div class="three-lens-property-row compact">
                <span class="three-lens-property-name">Type</span>
                <span class="three-lens-property-value">${cameraInfo.type}</span>
              </div>
              <div class="three-lens-property-row compact">
                <span class="three-lens-property-name">Position</span>
                <span class="three-lens-property-value">(${cameraInfo.position.x.toFixed(1)}, ${cameraInfo.position.y.toFixed(1)}, ${cameraInfo.position.z.toFixed(1)})</span>
              </div>
            </div>
          `
              : ''
          }
          <div class="three-lens-camera-actions">
            <button class="three-lens-action-btn three-lens-home-btn" data-action="go-home" ${!hasHome ? 'disabled' : ''} title="Return to home position">
              <span class="three-lens-btn-icon">🏠</span>
              <span>Home</span>
            </button>
            <button class="three-lens-action-btn" data-action="save-home" title="Save current camera position as home">
              <span class="three-lens-btn-icon">💾</span>
              <span>Save Home</span>
            </button>
          </div>
          ${
            availableCameras.length > 1
              ? `
            <div class="three-lens-camera-switcher">
              <div class="three-lens-camera-switcher-title">Switch Camera</div>
              <div class="three-lens-camera-list">
                ${availableCameras
                  .map(
                    (cam, index) => `
                  <button class="three-lens-camera-item ${index === this.probe.getActiveCameraIndex() ? 'active' : ''}" 
                          data-camera-index="${index}" 
                          data-camera-uuid="${cam.uuid}"
                          title="${cam.type}">
                    <span class="three-lens-camera-item-icon">📷</span>
                    <span class="three-lens-camera-item-name">${cam.name}</span>
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
        ${this.renderCostRankingSection(costRanking)}
      </div>
    `;
  }

  private collectCostRanking(): Array<{
    debugId: string;
    name: string;
    type: string;
    cost: number;
    costLevel: string;
    triangles: number;
  }> {
    const snapshot = this.probe.takeSnapshot();
    const ranking: Array<{
      debugId: string;
      name: string;
      type: string;
      cost: number;
      costLevel: string;
      triangles: number;
    }> = [];

    const collectFromNode = (node: SceneNode) => {
      if (node.meshData?.costData) {
        ranking.push({
          debugId: node.ref.debugId,
          name: node.ref.name || 'unnamed',
          type: node.ref.type,
          cost: node.meshData.costData.totalCost,
          costLevel: node.meshData.costData.costLevel,
          triangles: node.meshData.faceCount,
        });
      }
      for (const child of node.children) {
        collectFromNode(child);
      }
    };

    for (const scene of snapshot.scenes) {
      collectFromNode(scene);
    }

    // Sort by cost (highest first)
    ranking.sort((a, b) => b.cost - a.cost);

    return ranking;
  }

  private renderCostRankingSection(
    ranking: Array<{
      debugId: string;
      name: string;
      type: string;
      cost: number;
      costLevel: string;
      triangles: number;
    }>
  ): string {
    if (ranking.length === 0) {
      return '';
    }

    // Get total scene cost
    const totalCost = ranking.reduce((sum, item) => sum + item.cost, 0);
    const totalTriangles = ranking.reduce(
      (sum, item) => sum + item.triangles,
      0
    );

    // Count by cost level
    const criticalCount = ranking.filter(
      (r) => r.costLevel === 'critical'
    ).length;
    const highCount = ranking.filter((r) => r.costLevel === 'high').length;

    // Take top 5 for display
    const topItems = ranking.slice(0, 5);

    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Cost Ranking</div>
        <div class="three-lens-cost-summary">
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${totalCost.toFixed(1)}</span>
            <span class="three-lens-cost-summary-label">Total Cost</span>
          </div>
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${formatNumber(totalTriangles)}</span>
            <span class="three-lens-cost-summary-label">Triangles</span>
          </div>
          <div class="three-lens-cost-summary-stat">
            <span class="three-lens-cost-summary-value">${ranking.length}</span>
            <span class="three-lens-cost-summary-label">Meshes</span>
          </div>
        </div>
        ${
          criticalCount > 0 || highCount > 0
            ? `
          <div class="three-lens-cost-warning">
            ${criticalCount > 0 ? `<span class="cost-critical">🔥 ${criticalCount} critical</span>` : ''}
            ${highCount > 0 ? `<span class="cost-high">⚠ ${highCount} high cost</span>` : ''}
          </div>
        `
            : ''
        }
        <div class="three-lens-cost-ranking-list">
          ${topItems
            .map(
              (item, index) => `
            <div class="three-lens-cost-ranking-item" data-id="${item.debugId}" data-action="select-object">
              <span class="three-lens-cost-rank">#${index + 1}</span>
              <span class="three-lens-cost-ranking-name">${item.name}</span>
              <span class="three-lens-cost-ranking-triangles">${formatNumber(item.triangles)}</span>
              <span class="three-lens-cost-ranking-score cost-${item.costLevel}">${item.cost.toFixed(1)}</span>
            </div>
          `
            )
            .join('')}
        </div>
        ${ranking.length > 5 ? `<div class="three-lens-cost-more">+ ${ranking.length - 5} more objects</div>` : ''}
      </div>
    `;
  }

  private renderMeshInfo(meshData: NonNullable<SceneNode['meshData']>): string {
    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Mesh</div>
        ${this.renderProp('Vertices', formatNumber(meshData.vertexCount))}
        ${this.renderProp('Triangles', formatNumber(meshData.faceCount))}
        ${this.renderProp('Geometry', meshData.geometryRef ? meshData.geometryRef.substring(0, 8) + '...' : '(none)')}
        ${this.renderProp('Material', this.formatMaterialRefs(meshData.materialRefs))}
        ${this.renderProp('Cast Shadow', meshData.castShadow)}
        ${this.renderProp('Receive Shadow', meshData.receiveShadow)}
      </div>
      ${meshData.costData ? this.renderCostAnalysis(meshData.costData) : ''}
    `;
  }

  private renderCostAnalysis(
    costData: NonNullable<NonNullable<SceneNode['meshData']>['costData']>
  ): string {
    const costLevelClass = `cost-${costData.costLevel}`;
    const costLevelLabel =
      costData.costLevel.charAt(0).toUpperCase() + costData.costLevel.slice(1);

    // Calculate cost breakdown percentages
    const total =
      costData.triangleCost +
      costData.materialComplexity +
      costData.textureCost +
      costData.shadowCost;
    const triPct =
      total > 0 ? ((costData.triangleCost / total) * 100).toFixed(0) : '0';
    const matPct =
      total > 0
        ? ((costData.materialComplexity / total) * 100).toFixed(0)
        : '0';
    const texPct =
      total > 0 ? ((costData.textureCost / total) * 100).toFixed(0) : '0';
    const shadowPct =
      total > 0 ? ((costData.shadowCost / total) * 100).toFixed(0) : '0';

    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Cost Analysis</div>
        <div class="three-lens-cost-header">
          <span class="three-lens-cost-level ${costLevelClass}">${costLevelLabel}</span>
          <span class="three-lens-cost-score">${costData.totalCost.toFixed(1)} pts</span>
        </div>
        <div class="three-lens-cost-breakdown">
          <div class="three-lens-cost-bar">
            <div class="three-lens-cost-bar-segment triangles" style="width: ${triPct}%" title="Triangles: ${triPct}%"></div>
            <div class="three-lens-cost-bar-segment material" style="width: ${matPct}%" title="Material: ${matPct}%"></div>
            <div class="three-lens-cost-bar-segment textures" style="width: ${texPct}%" title="Textures: ${texPct}%"></div>
            <div class="three-lens-cost-bar-segment shadows" style="width: ${shadowPct}%" title="Shadows: ${shadowPct}%"></div>
          </div>
          <div class="three-lens-cost-legend">
            <span class="three-lens-cost-legend-item triangles">▪ Tris ${triPct}%</span>
            <span class="three-lens-cost-legend-item material">▪ Mat ${matPct}%</span>
            <span class="three-lens-cost-legend-item textures">▪ Tex ${texPct}%</span>
            <span class="three-lens-cost-legend-item shadows">▪ Shd ${shadowPct}%</span>
          </div>
        </div>
        <div class="three-lens-cost-details">
          ${this.renderCostRow('Triangles', costData.triangleCost.toFixed(2), formatNumber(Math.round(costData.triangleCost * 1000)) + ' tris')}
          ${this.renderCostRow('Material', costData.materialComplexity.toFixed(1) + '/10', this.getMaterialComplexityLabel(costData.materialComplexity))}
          ${this.renderCostRow('Textures', costData.textureCost.toFixed(1), costData.materials.reduce((s, m) => s + m.textureCount, 0) + ' maps')}
          ${this.renderCostRow('Shadows', costData.shadowCost.toFixed(1), this.getShadowLabel(costData.shadowCost))}
        </div>
        ${this.renderMaterialDetails(costData.materials)}
      </div>
    `;
  }

  private renderCostRow(label: string, value: string, detail: string): string {
    return `
      <div class="three-lens-cost-row">
        <span class="three-lens-cost-row-label">${label}</span>
        <span class="three-lens-cost-row-value">${value}</span>
        <span class="three-lens-cost-row-detail">${detail}</span>
      </div>
    `;
  }

  private getMaterialComplexityLabel(complexity: number): string {
    if (complexity <= 2) return 'Simple';
    if (complexity <= 4) return 'Standard';
    if (complexity <= 6) return 'Complex';
    if (complexity <= 8) return 'Heavy';
    return 'Very Heavy';
  }

  private getShadowLabel(shadowCost: number): string {
    if (shadowCost === 0) return 'None';
    if (shadowCost === 1) return 'Receive only';
    if (shadowCost === 2) return 'Cast only';
    return 'Cast + Receive';
  }

  private renderMaterialDetails(
    materials: NonNullable<
      NonNullable<SceneNode['meshData']>['costData']
    >['materials']
  ): string {
    if (materials.length === 0) return '';

    return `
      <div class="three-lens-material-details">
        <div class="three-lens-material-details-header">Materials (${materials.length})</div>
        ${materials
          .map(
            (mat, _i) => `
          <div class="three-lens-material-item">
            <span class="three-lens-material-type">${mat.type}</span>
            <span class="three-lens-material-score">${mat.complexityScore.toFixed(1)}/10</span>
            <div class="three-lens-material-features">
              ${mat.textureCount > 0 ? `<span class="three-lens-mat-feature" title="Textures">🖼 ${mat.textureCount}</span>` : ''}
              ${mat.hasNormalMap ? `<span class="three-lens-mat-feature" title="Normal Map">N</span>` : ''}
              ${mat.hasEnvMap ? `<span class="three-lens-mat-feature" title="Environment Map">E</span>` : ''}
              ${mat.transparent ? `<span class="three-lens-mat-feature" title="Transparent">α</span>` : ''}
              ${mat.doubleSided ? `<span class="three-lens-mat-feature" title="Double Sided">⇄</span>` : ''}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private renderLightInfo(
    lightData: NonNullable<SceneNode['lightData']>
  ): string {
    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Light</div>
        ${this.renderProp('Light Type', lightData.lightType)}
        ${this.renderProp('Color', '#' + lightData.color.toString(16).padStart(6, '0').toUpperCase())}
        ${this.renderProp('Intensity', lightData.intensity.toFixed(2))}
        ${this.renderProp('Cast Shadow', lightData.castShadow)}
        ${lightData.distance !== undefined ? this.renderProp('Distance', lightData.distance) : ''}
        ${lightData.angle !== undefined ? this.renderProp('Angle', ((lightData.angle * 180) / Math.PI).toFixed(1) + '°') : ''}
      </div>
    `;
  }

  private renderCameraInfo(
    cameraData: NonNullable<SceneNode['cameraData']>
  ): string {
    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Camera</div>
        ${this.renderProp('Camera Type', cameraData.cameraType)}
        ${this.renderProp('Near', cameraData.near)}
        ${this.renderProp('Far', cameraData.far)}
        ${cameraData.fov !== undefined ? this.renderProp('FOV', cameraData.fov + '°') : ''}
        ${cameraData.aspect !== undefined ? this.renderProp('Aspect', cameraData.aspect.toFixed(2)) : ''}
      </div>
    `;
  }

  private renderVisualOverlaysSection(node: SceneNode): string {
    // Only show for meshes (objects that can have wireframe/bounding box)
    const isMesh =
      node.ref.type === 'Mesh' ||
      node.ref.type === 'SkinnedMesh' ||
      node.ref.type === 'InstancedMesh';

    if (!isMesh) {
      // Don't show visual overlays section for non-mesh objects
      return this.renderTransformGizmoSection();
    }

    // Get the actual object to check current state
    const obj = this.probe.getSelectedObject();
    const wireframeEnabled = obj ? this.probe.isWireframeEnabled(obj) : false;
    const boundingBoxEnabled = obj
      ? this.probe.isBoundingBoxEnabled(obj)
      : false;

    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Visual Overlays</div>
        <div class="three-lens-toggle-row" data-action="toggle-wireframe">
          <span class="three-lens-toggle-label">Wireframe</span>
          <button class="three-lens-toggle-btn ${wireframeEnabled ? 'active' : ''}" title="Toggle wireframe for this object">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>
        <div class="three-lens-toggle-row" data-action="toggle-boundingbox">
          <span class="three-lens-toggle-label">Bounding Box</span>
          <button class="three-lens-toggle-btn ${boundingBoxEnabled ? 'active' : ''}" title="Toggle bounding box for this object">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>
      ${this.renderTransformGizmoSection()}
    `;
  }

  private renderCameraControlsSection(_node: SceneNode): string {
    const isAnimating = this.probe.isCameraAnimating();
    const hasHome = this.probe.hasHomePosition();

    // Only show object-specific camera controls (Focus, Fly To)
    // Global camera controls (switcher, home) are in Global Tools
    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Camera</div>
        
        <div class="three-lens-camera-actions">
          <button class="three-lens-action-btn" data-action="focus-selected" title="Focus camera on selected object (F)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
            </svg>
            Focus
          </button>
          <button class="three-lens-action-btn" data-action="fly-to-selected" title="Fly camera to selected object">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Fly To
          </button>
          <button class="three-lens-action-btn home" data-action="go-home" ${!hasHome ? 'disabled' : ''} title="Return to home view (H)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </button>
        </div>
        
        ${
          isAnimating
            ? `
          <button class="three-lens-action-btn stop" data-action="stop-animation" title="Stop camera animation">
            Stop Animation
          </button>
        `
            : ''
        }
      </div>
    `;
  }

  private renderTransformGizmoSection(): string {
    const gizmoEnabled = this.probe.isTransformGizmoEnabled();
    const mode = this.probe.getTransformMode();
    const space = this.probe.getTransformSpace();
    const snapEnabled = this.probe.isTransformSnapEnabled();
    const canUndo = this.probe.canUndoTransform();
    const canRedo = this.probe.canRedoTransform();

    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Transform Gizmo</div>
        
        <div class="three-lens-toggle-row" data-action="toggle-transform-gizmo">
          <span class="three-lens-toggle-label">Enable Gizmo</span>
          <button class="three-lens-toggle-btn ${gizmoEnabled ? 'active' : ''}" title="Enable transform gizmo">
            <span class="three-lens-toggle-track">
              <span class="three-lens-toggle-thumb"></span>
            </span>
          </button>
        </div>

        <div class="three-lens-transform-modes ${!gizmoEnabled ? 'disabled' : ''}">
          <div class="three-lens-mode-label">Mode</div>
          <div class="three-lens-mode-buttons">
            <button class="three-lens-mode-btn ${mode === 'translate' ? 'active' : ''}" data-mode="translate" title="Translate (W)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
              </svg>
            </button>
            <button class="three-lens-mode-btn ${mode === 'rotate' ? 'active' : ''}" data-mode="rotate" title="Rotate (E)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </button>
            <button class="three-lens-mode-btn ${mode === 'scale' ? 'active' : ''}" data-mode="scale" title="Scale (R)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-6-6m6 6v-4.8m0 4.8h-4.8"/>
                <path d="M3 16.2V21h4.8"/>
                <path d="M21 7.8V3h-4.8"/>
                <path d="M3 7.8V3h4.8"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="three-lens-transform-options ${!gizmoEnabled ? 'disabled' : ''}">
          <div class="three-lens-option-row" data-action="toggle-space">
            <span class="three-lens-option-label">Space</span>
            <button class="three-lens-space-btn" title="Toggle between world and local space">
              ${space === 'world' ? 'World' : 'Local'}
            </button>
          </div>
          
          <div class="three-lens-toggle-row" data-action="toggle-snap">
            <span class="three-lens-toggle-label">Snap to Grid</span>
            <button class="three-lens-toggle-btn ${snapEnabled ? 'active' : ''}" title="Enable grid snapping">
              <span class="three-lens-toggle-track">
                <span class="three-lens-toggle-thumb"></span>
              </span>
            </button>
          </div>
        </div>

        <div class="three-lens-undo-redo ${!gizmoEnabled ? 'disabled' : ''}">
          <button class="three-lens-undo-btn ${!canUndo ? 'disabled' : ''}" data-action="undo-transform" title="Undo (Ctrl+Z)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v6h6"/>
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
            </svg>
            Undo
          </button>
          <button class="three-lens-redo-btn ${!canRedo ? 'disabled' : ''}" data-action="redo-transform" title="Redo (Ctrl+Shift+Z)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 7v6h-6"/>
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
            </svg>
            Redo
          </button>
        </div>
      </div>
    `;
  }

  private formatLayers(layerMask: number): string {
    if (layerMask === 0) return 'None';
    if (layerMask === 1) return '0 (default)';

    const enabledLayers: number[] = [];
    for (let i = 0; i < 32; i++) {
      if (layerMask & (1 << i)) {
        enabledLayers.push(i);
      }
    }

    if (enabledLayers.length === 1) {
      return enabledLayers[0] === 0 ? '0 (default)' : String(enabledLayers[0]);
    }

    return enabledLayers.join(', ');
  }

  private formatMaterialRefs(refs: string[]): string {
    if (refs.length === 0) return '(none)';
    if (refs.length === 1) {
      return refs[0] ? refs[0].substring(0, 8) + '...' : '(none)';
    }
    const first = refs[0] ? refs[0].substring(0, 8) : '???';
    return `${first}... +${refs.length - 1}`;
  }

  private renderProp(name: string, value: unknown): string {
    return `<div class="three-lens-property-row"><span class="three-lens-property-name">${name}</span><span class="three-lens-property-value">${String(value)}</span></div>`;
  }

  private renderVectorProp(
    name: string,
    vec: { x: number; y: number; z: number },
    isRotation = false
  ): string {
    const m = isRotation ? 180 / Math.PI : 1;
    return `
      <div class="three-lens-property-row">
        <span class="three-lens-property-name">${name}</span>
        <div class="three-lens-vector-inputs">
          <div class="three-lens-vector-input"><input type="number" value="${(vec.x * m).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">X</div></div>
          <div class="three-lens-vector-input"><input type="number" value="${(vec.y * m).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">Y</div></div>
          <div class="three-lens-vector-input"><input type="number" value="${(vec.z * m).toFixed(2)}" step="0.1"><div class="three-lens-vector-label">Z</div></div>
        </div>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // PANEL UPDATES
  // ═══════════════════════════════════════════════════════════════

  private updateStatsPanel(): void {
    const content = document.getElementById('three-lens-content-stats');
    if (!content) return;

    // Check if tabs already exist - if so, only update the tab content
    const existingTabs = document.getElementById('three-lens-stats-tabs');
    const tabContent = document.getElementById('three-lens-stats-tab-content');

    if (existingTabs && tabContent) {
      // Only update the tab content, not the tabs themselves
      if (this.statsTab === 'timeline') {
        // For timeline, only re-render the chart (not the whole HTML) to preserve state
        // Skip if hovering or dragging to prevent jank
        if (!this.timelinePaused && !this.timelineDragging) {
          this.renderTimelineChart();
        }
      } else {
        tabContent.innerHTML = this.renderCurrentTabContent();
        if (this.statsTab === 'overview') {
          this.attachChartEvents();
          this.renderChart();
        }
      }
    } else {
      // Initial render or transitioning from "Waiting for data..." state
      // Render everything and attach events
      content.innerHTML = this.renderStatsContent();
      // Only attach events if tabs were actually rendered (stats exist)
      if (document.getElementById('three-lens-stats-tabs')) {
        this.attachStatsTabEvents(content);
      }
      if (this.statsTab === 'overview') {
        this.attachChartEvents();
        this.renderChart();
      } else if (this.statsTab === 'timeline') {
        this.attachTimelineEvents();
        this.renderTimelineChart();
      } else if (this.statsTab === 'resources') {
        this.attachResourceEvents();
      }
    }
  }

  private renderCurrentTabContent(): string {
    const stats = this.latestStats;
    if (!stats) {
      return `<div class="three-lens-inspector-empty">Waiting for frame data...</div>`;
    }

    const benchmark = this.latestBenchmark;
    const fps =
      stats.performance?.fps ??
      (stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0);
    const fpsSmoothed = stats.performance?.fpsSmoothed ?? fps;
    const fps1Low = stats.performance?.fps1PercentLow ?? 0;

    switch (this.statsTab) {
      case 'overview':
        return this.renderOverviewTab(
          stats,
          benchmark,
          fps,
          fpsSmoothed,
          fps1Low
        );
      case 'memory':
        return this.renderMemoryTab(stats);
      case 'rendering':
        return this.renderRenderingTab(stats);
      case 'timeline':
        return this.renderTimelineTab(stats);
      case 'resources':
        return this.renderResourcesTab();
      default:
        return '';
    }
  }

  private attachStatsTabEvents(container: HTMLElement): void {
    container.querySelectorAll('.three-lens-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const tabName = (e.currentTarget as HTMLElement).dataset.tab as
          | 'overview'
          | 'memory'
          | 'rendering'
          | 'timeline'
          | 'resources';
        if (tabName && tabName !== this.statsTab) {
          this.statsTab = tabName;
          // Update tab active states
          container.querySelectorAll('.three-lens-tab').forEach((t) => {
            t.classList.toggle(
              'active',
              (t as HTMLElement).dataset.tab === tabName
            );
          });
          // Update content
          const tabContent = document.getElementById(
            'three-lens-stats-tab-content'
          );
          if (tabContent) {
            tabContent.innerHTML = this.renderCurrentTabContent();
            if (this.statsTab === 'overview') {
              this.attachChartEvents();
              this.renderChart();
            } else if (this.statsTab === 'timeline') {
              this.attachTimelineEvents();
              this.renderTimelineChart();
            } else if (this.statsTab === 'resources') {
              this.attachResourceEvents();
            }
          }
        }
      });
    });
  }

  private attachResourceEvents(): void {
    // Toggle stack traces
    const stackTraceToggle = document.querySelector(
      '[data-action="toggle-stack-traces"]'
    );
    const stackTraceBtn = stackTraceToggle?.querySelector(
      '.three-lens-toggle-btn'
    );
    stackTraceToggle?.addEventListener('click', () => {
      const isEnabled = this.probe.isResourceStackTraceCaptureEnabled();
      this.probe.setResourceStackTraceCapture(!isEnabled);
      stackTraceBtn?.classList.toggle('active', !isEnabled);
    });

    // Clear events button
    document
      .querySelector('[data-action="clear-resource-events"]')
      ?.addEventListener('click', () => {
        this.probe.clearResourceEvents();
        this.updateResourcesView();
      });

    // Run leak detection button
    document
      .querySelector('[data-action="run-leak-detection"]')
      ?.addEventListener('click', () => {
        this.probe.runLeakDetection();
        this.updateResourcesView();
      });

    // Generate leak report button
    document
      .querySelector('[data-action="generate-leak-report"]')
      ?.addEventListener('click', () => {
        const report = this.probe.generateLeakReport();
        this.showLeakReport(report);
      });

    // Clear leak alerts button
    document
      .querySelector('[data-action="clear-leak-alerts"]')
      ?.addEventListener('click', () => {
        this.probe.clearLeakAlerts();
        this.updateResourcesView();
      });
  }

  private showLeakReport(report: LeakReport): void {
    // Create a modal or log the report
    const formatBytes = (bytes: number): string => {
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    const reportText = `
═══════════════════════════════════════════════════════════════
                    3LENS LEAK DETECTION REPORT
═══════════════════════════════════════════════════════════════

Session Duration: ${(report.sessionDurationMs / 1000 / 60).toFixed(1)} minutes
Generated At: ${new Date().toISOString()}

SUMMARY
───────────────────────────────────────────────────────────────
Total Alerts: ${report.summary.totalAlerts}
  • Critical: ${report.summary.criticalAlerts}
  • Warning: ${report.summary.warningAlerts}
  • Info: ${report.summary.infoAlerts}

Estimated Leaked Memory: ${formatBytes(report.summary.estimatedLeakedMemoryBytes)}

RESOURCE STATISTICS
───────────────────────────────────────────────────────────────
Geometries: ${report.resourceStats.geometries.created} created, ${report.resourceStats.geometries.disposed} disposed, ${report.resourceStats.geometries.orphaned} orphaned, ${report.resourceStats.geometries.leaked} leaked
Materials:  ${report.resourceStats.materials.created} created, ${report.resourceStats.materials.disposed} disposed, ${report.resourceStats.materials.orphaned} orphaned, ${report.resourceStats.materials.leaked} leaked
Textures:   ${report.resourceStats.textures.created} created, ${report.resourceStats.textures.disposed} disposed, ${report.resourceStats.textures.orphaned} orphaned, ${report.resourceStats.textures.leaked} leaked

${
  report.alerts.length > 0
    ? `
ALERTS
───────────────────────────────────────────────────────────────
${report.alerts
  .map(
    (a) => `[${a.severity.toUpperCase()}] ${a.message}
   ${a.details}
   💡 ${a.suggestion}
`
  )
  .join('\n')}
`
    : ''
}

${
  report.recommendations.length > 0
    ? `
RECOMMENDATIONS
───────────────────────────────────────────────────────────────
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`
    : ''
}

═══════════════════════════════════════════════════════════════
`;

    // Log to console for easy copying
    /* eslint-disable no-console */
    console.log(
      '%c3Lens Leak Report',
      'font-size: 16px; font-weight: bold; color: #60a5fa;'
    );
    console.log(reportText);
    /* eslint-enable no-console */

    // Also show a brief notification in the UI
    alert(
      `Leak Report Generated!\n\nCheck the browser console for the full report.\n\nSummary:\n• ${report.summary.totalAlerts} alerts\n• ${formatBytes(report.summary.estimatedLeakedMemoryBytes)} estimated leaked memory\n• ${report.recommendations.length} recommendations`
    );
  }

  private updateResourcesView(): void {
    const tabContent = document.getElementById('three-lens-stats-tab-content');
    if (tabContent && this.statsTab === 'resources') {
      tabContent.innerHTML = this.renderCurrentTabContent();
      this.attachResourceEvents();
    }
  }

  private updateScenePanel(): void {
    const content = document.getElementById('three-lens-content-scene');
    if (content) {
      // Preserve scroll position of the inspector pane
      const inspectorPane = content.querySelector('.three-lens-inspector-pane');
      const scrollTop = inspectorPane?.scrollTop ?? 0;

      content.innerHTML = this.renderSceneContent();
      const panel = document.getElementById('three-lens-panel-scene');
      if (panel) this.attachTreeEvents(panel);

      // Initialize virtual scroller if needed (after DOM is ready)
      requestAnimationFrame(() => {
        this.initVirtualScroller();
        this.attachVirtualTreeEvents();
      });

      // Restore scroll position
      if (scrollTop > 0) {
        const newInspectorPane = content.querySelector(
          '.three-lens-inspector-pane'
        );
        if (newInspectorPane) {
          newInspectorPane.scrollTop = scrollTop;
        }
      }
    }
  }

  private updateInspectorPanel(): void {
    const panel = document.getElementById('three-lens-panel-scene');
    const content = document.getElementById('three-lens-content-scene');
    if (!panel || !content) return;

    // Lock the current width to prevent shrinking during DOM update
    const currentWidth = panel.offsetWidth;
    panel.style.minWidth = `${currentWidth}px`;

    // Update the content (this changes the DOM structure)
    this.updateScenePanel();

    // Now animate to the target width
    requestAnimationFrame(() => {
      this.updateScenePanelSize();
    });
  }

  private updateScenePanelSize(): void {
    const panel = document.getElementById('three-lens-panel-scene');
    const state = this.openPanels.get('scene');
    if (!panel || !state) return;

    // Scene panel always uses the fixed width (tree + inspector/global tools)
    panel.style.minWidth = `${SCENE_PANEL_WIDTH}px`;

    if (state.width !== SCENE_PANEL_WIDTH) {
      state.width = SCENE_PANEL_WIDTH;
      panel.style.width = `${SCENE_PANEL_WIDTH}px`;
    }
  }

  private attachTreeEvents(panel: HTMLElement): void {
    // Visibility toggle buttons (eye icons)
    panel.querySelectorAll('.three-lens-visibility-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger node selection
        const id = (btn as HTMLElement).dataset.id;
        if (id) {
          this.toggleObjectVisibility(id);
        }
      });
    });

    // Visual overlays toggle buttons
    panel.querySelectorAll('.three-lens-toggle-row').forEach((row) => {
      const action = (row as HTMLElement).dataset.action;
      const btn = row.querySelector('.three-lens-toggle-btn');
      if (!btn || !action) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = btn.classList.contains('active');

        switch (action) {
          case 'toggle-wireframe':
            this.probe.toggleSelectedWireframe(!isActive);
            btn.classList.toggle('active', !isActive);
            break;
          case 'toggle-boundingbox':
            this.probe.toggleSelectedBoundingBox(!isActive);
            btn.classList.toggle('active', !isActive);
            break;
          case 'toggle-global-wireframe':
            this.probe.toggleGlobalWireframe(!isActive);
            btn.classList.toggle('active', !isActive);
            break;
          case 'toggle-transform-gizmo':
            if (!isActive) {
              this.probe.enableTransformGizmo().then(() => {
                btn.classList.toggle('active', true);
                this.updateScenePanel(); // Refresh to update disabled states
              });
            } else {
              this.probe.disableTransformGizmo();
              btn.classList.toggle('active', false);
              this.updateScenePanel(); // Refresh to update disabled states
            }
            break;
          case 'toggle-snap':
            this.probe.setTransformSnapEnabled(!isActive);
            btn.classList.toggle('active', !isActive);
            break;
        }
      });
    });

    // Transform mode buttons
    panel.querySelectorAll('.three-lens-mode-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = (btn as HTMLElement).dataset.mode as
          | 'translate'
          | 'rotate'
          | 'scale';
        if (mode && this.probe.isTransformGizmoEnabled()) {
          this.probe.setTransformMode(mode);
          // Update active states
          panel.querySelectorAll('.three-lens-mode-btn').forEach((b) => {
            b.classList.toggle(
              'active',
              (b as HTMLElement).dataset.mode === mode
            );
          });
        }
      });
    });

    // Space toggle button
    panel
      .querySelectorAll('.three-lens-option-row[data-action="toggle-space"]')
      .forEach((row) => {
        const btn = row.querySelector('.three-lens-space-btn');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.probe.isTransformGizmoEnabled()) {
              const newSpace = this.probe.toggleTransformSpace();
              btn.textContent = newSpace === 'world' ? 'World' : 'Local';
            }
          });
        }
      });

    // Undo/Redo buttons
    panel.querySelectorAll('.three-lens-undo-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.probe.canUndoTransform()) {
          this.probe.undoTransform();
          this.updateScenePanel();
        }
      });
    });

    panel.querySelectorAll('.three-lens-redo-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.probe.canRedoTransform()) {
          this.probe.redoTransform();
          this.updateScenePanel();
        }
      });
    });

    // Camera control buttons
    panel.querySelectorAll('.three-lens-action-btn').forEach((btn) => {
      const action = (btn as HTMLElement).dataset.action;
      if (!action) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();

        switch (action) {
          case 'focus-selected':
            this.probe.focusOnSelected();
            break;
          case 'fly-to-selected':
            this.probe.flyToSelected({
              duration: 800,
              easing: 'easeInOut',
              onComplete: () => this.updateScenePanel(),
            });
            this.updateScenePanel(); // Show "Stop Animation" button
            break;
          case 'stop-animation':
            this.probe.stopCameraAnimation();
            this.updateScenePanel();
            break;
          case 'go-home':
            this.probe.flyHome({
              duration: 600,
              easing: 'easeOut',
              onComplete: () => this.updateScenePanel(),
            });
            break;
          case 'save-home':
            this.probe.saveCurrentCameraAsHome();
            break;
        }
      });
    });

    // Camera switcher buttons
    panel.querySelectorAll('.three-lens-camera-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(
          (btn as HTMLElement).dataset.cameraIndex || '0',
          10
        );
        if (this.probe.switchToCamera(index)) {
          this.updateScenePanel();
        }
      });
    });

    // Cost ranking item selection
    panel.querySelectorAll('.three-lens-cost-ranking-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (item as HTMLElement).dataset.id;
        if (id) {
          this.probe.selectByDebugId(id);
        }
      });
    });

    // Tree node events
    panel.querySelectorAll('.three-lens-node-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        // Ignore if clicking visibility button
        if ((e.target as HTMLElement).closest('.three-lens-visibility-btn')) {
          return;
        }

        const node = (header as HTMLElement).parentElement;
        const id = node?.dataset.id;
        if (!id) return;

        const toggle = (e.target as HTMLElement).closest(
          '.three-lens-node-toggle'
        );
        if (toggle && !toggle.classList.contains('hidden')) {
          if (this.expandedNodes.has(id)) {
            this.expandedNodes.delete(id);
          } else {
            this.expandedNodes.add(id);
          }
          this.updateScenePanel();
          return;
        }

        // Toggle selection - if already selected, deselect; otherwise select
        if (this.selectedNodeId === id) {
          // Deselect
          this.probe.selectObject(null);
        } else {
          // Select the object in the probe (this triggers onSelectionChanged callback
          // which updates the scene panel, inspector panel, and shows 3D bounding box)
          this.probe.selectByDebugId(id);
        }
      });
    });
  }

  private toggleObjectVisibility(debugId: string): void {
    // Save current selection state
    const prevSelectedId = this.selectedNodeId;

    // Find the object by selecting it temporarily
    if (this.probe.selectByDebugId(debugId)) {
      const obj = this.probe.getSelectedObject();
      if (obj) {
        obj.visible = !obj.visible;
      }
    }

    // Restore previous selection
    if (prevSelectedId) {
      this.probe.selectByDebugId(prevSelectedId);
    } else {
      this.probe.selectObject(null);
    }
    this.selectedNodeId = prevSelectedId;

    // Update UI
    this.updateScenePanel();
    this.updateInspectorPanel();
  }

  /**
   * Attach event handlers for virtual scrolling tree
   * Uses event delegation on the container for efficiency
   */
  private attachVirtualTreeEvents(): void {
    const container = document.getElementById('three-lens-virtual-tree');
    if (!container) return;

    // Use event delegation - attach handlers to the container, not individual rows
    // This is more efficient as rows are dynamically created/destroyed during scrolling
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Handle visibility button clicks
      const visibilityBtn = target.closest(
        '.three-lens-visibility-btn'
      ) as HTMLElement;
      if (visibilityBtn) {
        const id = visibilityBtn.dataset.id;
        if (id) {
          this.toggleObjectVisibility(id);
        }
        return;
      }

      // Handle row/header clicks
      const row = target.closest('.three-lens-virtual-row') as HTMLElement;
      if (!row) return;

      const id = row.dataset.id;
      if (!id) return;

      // Handle toggle expand/collapse
      const toggle = target.closest('.three-lens-node-toggle') as HTMLElement;
      if (toggle && !toggle.classList.contains('hidden')) {
        if (this.expandedNodes.has(id)) {
          this.expandedNodes.delete(id);
        } else {
          this.expandedNodes.add(id);
        }
        // Update virtual scroller with new expanded state
        if (this.virtualScroller) {
          this.virtualScroller.rebuildFlattenedList();
          this.virtualScroller.forceRender();
        }
        // Also update inspector if needed
        this.updateInspectorPane();
        return;
      }

      // Handle node selection
      if (this.selectedNodeId === id) {
        // Deselect
        this.probe.selectObject(null);
      } else {
        // Select the object
        this.probe.selectByDebugId(id);
      }
    });
  }

  /**
   * Update only the inspector pane without re-rendering the tree
   */
  private updateInspectorPane(): void {
    const content = document.getElementById('three-lens-content-scene');
    if (!content) return;

    const inspectorPane = content.querySelector('.three-lens-inspector-pane');
    if (!inspectorPane) return;

    // Find selected node
    const snapshot = this.probe.takeSnapshot();
    const selectedNode = this.selectedNodeId
      ? this.findNodeById(snapshot.scenes, this.selectedNodeId)
      : null;

    // Update inspector content
    inspectorPane.innerHTML = selectedNode
      ? this.renderNodeInspector(selectedNode)
      : this.renderGlobalTools();

    // Re-attach inspector events
    const panel = document.getElementById('three-lens-panel-scene');
    if (panel) this.attachTreeEvents(panel);
  }

  // ═══════════════════════════════════════════════════════════════
  // CHART HELPERS
  // ═══════════════════════════════════════════════════════════════

  private getVisibleFrameCount(): number {
    return Math.max(10, Math.floor(60 / this.chartZoom));
  }

  private getVisibleFrameData(): number[] {
    const visibleCount = this.getVisibleFrameCount();
    const endIndex = this.frameHistory.length - this.chartOffset;
    const startIndex = Math.max(0, endIndex - visibleCount);
    return this.frameHistory.slice(startIndex, endIndex);
  }

  private getFrameTimeMin(): number {
    const data = this.getVisibleFrameData();
    return data.length > 0 ? Math.min(...data) : 0;
  }

  private getFrameTimeMax(): number {
    const data = this.getVisibleFrameData();
    return data.length > 0 ? Math.max(...data) : 0;
  }

  private getFrameTimeAvg(): number {
    const data = this.getVisibleFrameData();
    if (data.length === 0) return 0;
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private getFrameTimeJitter(): number {
    const data = this.getVisibleFrameData();
    if (data.length < 2) return 0;
    const avg = this.getFrameTimeAvg();
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  private handleChartZoomIn(): void {
    if (this.chartZoom < 4) {
      this.chartZoom *= 1.5;
      this.updateChartView();
    }
  }

  private handleChartZoomOut(): void {
    if (this.chartZoom > 0.5) {
      this.chartZoom /= 1.5;
      this.chartOffset = Math.max(
        0,
        Math.min(
          this.chartOffset,
          this.frameHistory.length - this.getVisibleFrameCount()
        )
      );
      this.updateChartView();
    }
  }

  private handleChartReset(): void {
    this.chartZoom = 1;
    this.chartOffset = 0;
    this.updateChartView();
  }

  private updateChartView(): void {
    this.renderChart();
    // Update zoom label
    const zoomLabel = document.getElementById('three-lens-chart-zoom-label');
    if (zoomLabel) {
      zoomLabel.textContent = `${this.getVisibleFrameCount()}f`;
    }
    // Update stats
    const minEl = document.getElementById('three-lens-chart-min');
    const avgEl = document.getElementById('three-lens-chart-avg');
    const maxEl = document.getElementById('three-lens-chart-max');
    const jitterEl = document.getElementById('three-lens-chart-jitter');
    if (minEl) minEl.textContent = `${this.getFrameTimeMin().toFixed(1)}ms`;
    if (avgEl) avgEl.textContent = `${this.getFrameTimeAvg().toFixed(1)}ms`;
    if (maxEl) maxEl.textContent = `${this.getFrameTimeMax().toFixed(1)}ms`;
    if (jitterEl)
      jitterEl.textContent = `${this.getFrameTimeJitter().toFixed(1)}ms`;
  }

  private attachChartEvents(): void {
    const container = document.getElementById('three-lens-chart-container');
    const canvas = document.getElementById(
      'three-lens-stats-chart'
    ) as HTMLCanvasElement;
    const tooltip = document.getElementById('three-lens-chart-tooltip');

    if (!container || !canvas) return;

    // Zoom controls
    document
      .getElementById('three-lens-chart-zoom-in')
      ?.addEventListener('click', () => this.handleChartZoomIn());
    document
      .getElementById('three-lens-chart-zoom-out')
      ?.addEventListener('click', () => this.handleChartZoomOut());
    document
      .getElementById('three-lens-chart-reset')
      ?.addEventListener('click', () => this.handleChartReset());

    // Clear violations button
    document
      .querySelector('[data-action="clear-violations"]')
      ?.addEventListener('click', () => {
        this.probe.clearViolations();
        // Re-render the tab content
        const tabContent = document.getElementById(
          'three-lens-stats-tab-content'
        );
        if (tabContent) {
          tabContent.innerHTML = this.renderCurrentTabContent();
          this.attachChartEvents();
          this.renderChart();
        }
      });

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.handleChartZoomIn();
      } else {
        this.handleChartZoomOut();
      }
    });

    // Pan with drag
    container.addEventListener('mousedown', (e) => {
      this.chartDragging = true;
      this.chartDragStartX = e.clientX;
      this.chartDragStartOffset = this.chartOffset;
      container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (this.chartDragging) {
        const dx = e.clientX - this.chartDragStartX;
        const visibleCount = this.getVisibleFrameCount();
        const framesPerPixel =
          visibleCount / canvas.getBoundingClientRect().width;
        const offsetDelta = Math.round(dx * framesPerPixel);
        const maxOffset = Math.max(0, this.frameHistory.length - visibleCount);
        this.chartOffset = Math.max(
          0,
          Math.min(maxOffset, this.chartDragStartOffset - offsetDelta)
        );
        this.updateChartView();
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.chartDragging) {
        this.chartDragging = false;
        if (container) container.style.cursor = 'grab';
      }
    });

    // Hover tooltip
    canvas.addEventListener('mousemove', (e) => {
      if (this.chartDragging || !tooltip) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const data = this.getVisibleFrameData();
      const barWidth = rect.width / data.length;
      const index = Math.floor(x / barWidth);

      if (index >= 0 && index < data.length) {
        this.chartHoverIndex = index;
        const frameTime = data[index];
        const fps = frameTime > 0 ? Math.round(1000 / frameTime) : 0;

        tooltip.style.display = 'block';
        tooltip.style.left = `${Math.min(x, rect.width - 80)}px`;
        tooltip.style.top = '-40px';

        const timeEl = tooltip.querySelector('.three-lens-tooltip-time');
        const fpsEl = tooltip.querySelector('.three-lens-tooltip-fps');
        if (timeEl) timeEl.textContent = `${frameTime.toFixed(2)}ms`;
        if (fpsEl) fpsEl.textContent = `${fps} FPS`;

        this.renderChart(); // Re-render to highlight bar
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
      this.chartHoverIndex = null;
      this.renderChart();
    });
  }

  private renderChart(): void {
    const canvas = document.getElementById(
      'three-lens-stats-chart'
    ) as HTMLCanvasElement;
    const data = this.getVisibleFrameData();
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const { width, height } = rect;
    const padding = { top: 4, bottom: 4, left: 0, right: 0 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Calculate max value for scale (at least 16.67ms for 60fps reference)
    const dataMax = Math.max(...data, 16.67);
    const maxValue = Math.ceil(dataMax / 8.33) * 8.33; // Round up to nearest ~8ms

    const barWidth = chartWidth / data.length;
    const barGap = Math.max(1, barWidth * 0.15);

    // Draw gridlines
    ctx.strokeStyle = 'rgba(45, 55, 72, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const gridValues = [16.67, 33.33]; // 60fps and 30fps lines
    gridValues.forEach((value) => {
      if (value <= maxValue) {
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }
    });

    // Draw 60fps target line (green)
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    const target60Y =
      padding.top + chartHeight - (16.67 / maxValue) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, target60Y);
    ctx.lineTo(width - padding.right, target60Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw average line
    const avg = this.getFrameTimeAvg();
    if (avg > 0) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      const avgY = padding.top + chartHeight - (avg / maxValue) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, avgY);
      ctx.lineTo(width - padding.right, avgY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Create gradient for bars
    const gradientGood = ctx.createLinearGradient(0, height, 0, 0);
    gradientGood.addColorStop(0, 'rgba(52, 211, 153, 0.9)');
    gradientGood.addColorStop(1, 'rgba(34, 211, 238, 0.9)');

    const gradientWarn = ctx.createLinearGradient(0, height, 0, 0);
    gradientWarn.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
    gradientWarn.addColorStop(1, 'rgba(245, 158, 11, 0.9)');

    const gradientBad = ctx.createLinearGradient(0, height, 0, 0);
    gradientBad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
    gradientBad.addColorStop(1, 'rgba(248, 113, 113, 0.9)');

    // Draw bars with color based on frame time
    data.forEach((value, i) => {
      const x = padding.left + i * barWidth + barGap / 2;
      const barHeight = (value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      const actualBarWidth = barWidth - barGap;

      // Color based on performance
      if (value <= 16.67) {
        ctx.fillStyle = gradientGood;
      } else if (value <= 33.33) {
        ctx.fillStyle = gradientWarn;
      } else {
        ctx.fillStyle = gradientBad;
      }

      // Highlight hovered bar
      if (this.chartHoverIndex === i) {
        ctx.fillStyle = 'rgba(96, 165, 250, 1)';
        ctx.shadowColor = 'rgba(96, 165, 250, 0.5)';
        ctx.shadowBlur = 8;
      }

      // Draw rounded bar
      const radius = Math.min(3, actualBarWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + actualBarWidth - radius, y);
      ctx.quadraticCurveTo(
        x + actualBarWidth,
        y,
        x + actualBarWidth,
        y + radius
      );
      ctx.lineTo(x + actualBarWidth, y + barHeight);
      ctx.lineTo(x, y + barHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
    });

    // Draw line graph on top
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    data.forEach((value, i) => {
      const x = padding.left + i * barWidth + barWidth / 2;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    data.forEach((value, i) => {
      const x = padding.left + i * barWidth + barWidth / 2;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

      // Only draw point for hovered bar
      if (this.chartHoverIndex === i) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  private attachTimelineEvents(): void {
    const container = document.getElementById(
      'three-lens-timeline-chart-container'
    );
    const canvas = document.getElementById(
      'three-lens-timeline-chart'
    ) as HTMLCanvasElement;
    const tooltip = document.getElementById('three-lens-timeline-tooltip');

    if (!container || !canvas) return;

    // Record/Stop button
    document
      .getElementById('three-lens-timeline-record')
      ?.addEventListener('click', () => {
        this.isRecording = !this.isRecording;
        if (this.isRecording) {
          // Start fresh recording
          this.recordedFrames = [];
        }
        this.updateTimelineView();
      });

    // Clear recording button
    document
      .getElementById('three-lens-timeline-clear')
      ?.addEventListener('click', () => {
        this.recordedFrames = [];
        this.updateTimelineView();
      });

    // Buffer size selector
    const bufferSelect = document.getElementById(
      'three-lens-timeline-buffer-size'
    ) as HTMLSelectElement;
    bufferSelect?.addEventListener('change', () => {
      this.frameBufferSize = parseInt(bufferSelect.value, 10);
      this.maxHistoryLength = this.frameBufferSize;
      // Trim existing history if needed
      while (this.frameHistory.length > this.frameBufferSize)
        this.frameHistory.shift();
      while (this.gpuHistory.length > this.frameBufferSize)
        this.gpuHistory.shift();
      while (this.fpsHistory.length > this.frameBufferSize)
        this.fpsHistory.shift();
      while (this.drawCallHistory.length > this.frameBufferSize)
        this.drawCallHistory.shift();
      while (this.triangleHistory.length > this.frameBufferSize)
        this.triangleHistory.shift();
      this.updateTimelineView();
    });

    // Zoom controls
    document
      .getElementById('three-lens-timeline-zoom-in')
      ?.addEventListener('click', () => {
        this.timelineZoom = Math.min(10, this.timelineZoom * 1.5);
        this.updateTimelineView();
      });

    document
      .getElementById('three-lens-timeline-zoom-out')
      ?.addEventListener('click', () => {
        this.timelineZoom = Math.max(0.1, this.timelineZoom / 1.5);
        this.updateTimelineView();
      });

    document
      .getElementById('three-lens-timeline-reset')
      ?.addEventListener('click', () => {
        this.timelineZoom = 1.0;
        this.timelineOffset = 0;
        this.timelineSelectedFrame = null;
        this.updateTimelineView();
      });

    // Close frame details
    document
      .getElementById('three-lens-timeline-close-details')
      ?.addEventListener('click', () => {
        this.timelineSelectedFrame = null;
        this.updateTimelineView();
      });

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.timelineZoom = Math.min(10, this.timelineZoom * 1.2);
      } else {
        this.timelineZoom = Math.max(0.1, this.timelineZoom / 1.2);
      }
      this.updateTimelineView();
    });

    // Pan with drag
    container.addEventListener('mousedown', (e) => {
      this.timelineDragging = true;
      this.timelineDragStartX = e.clientX;
      this.timelineDragStartOffset = this.timelineOffset;
      container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (this.timelineDragging) {
        const dx = e.clientX - this.timelineDragStartX;
        const visibleCount = this.getTimelineVisibleFrameCount();
        const rect = canvas.getBoundingClientRect();
        const framesPerPixel = visibleCount / rect.width;
        const offsetDelta = Math.round(dx * framesPerPixel);
        const maxOffset = Math.max(0, this.frameHistory.length - visibleCount);
        this.timelineOffset = Math.max(
          0,
          Math.min(maxOffset, this.timelineDragStartOffset - offsetDelta)
        );
        this.updateTimelineView();
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.timelineDragging) {
        this.timelineDragging = false;
        if (container) container.style.cursor = 'default';
      }
    });

    // Frame selection on click
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const visibleCount = this.getTimelineVisibleFrameCount();
      const barWidth = rect.width / visibleCount;
      const frameIndex = Math.floor(x / barWidth) + this.timelineOffset;

      if (frameIndex >= 0 && frameIndex < this.frameHistory.length) {
        this.timelineSelectedFrame = frameIndex;
        this.updateTimelineView();
      }
    });

    // Pause on mouse enter to prevent jank
    canvas.addEventListener('mouseenter', () => {
      this.timelinePaused = true;
    });

    // Hover tooltip
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const visibleCount = this.getTimelineVisibleFrameCount();
      const barWidth = rect.width / visibleCount;
      const frameIndex = Math.floor(x / barWidth) + this.timelineOffset;

      this.timelineHoverIndex = frameIndex;

      if (frameIndex >= 0 && frameIndex < this.frameHistory.length && tooltip) {
        const cpuTime = this.frameHistory[frameIndex];
        const gpuTime = this.gpuHistory[frameIndex];
        const fps = cpuTime > 0 ? 1000 / cpuTime : 0;

        tooltip.style.display = 'block';
        tooltip.style.left = `${e.clientX - rect.left + 10}px`;
        tooltip.style.top = `${e.clientY - rect.top - 10}px`;
        tooltip.innerHTML = `
          <div>Frame #${frameIndex + 1}</div>
          <div>CPU: ${cpuTime.toFixed(2)}ms</div>
          ${gpuTime !== undefined ? `<div>GPU: ${gpuTime.toFixed(2)}ms</div>` : ''}
          <div>FPS: ${fps.toFixed(1)}</div>
        `;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
      this.timelineHoverIndex = null;
      this.timelinePaused = false;
    });
  }

  private updateTimelineView(): void {
    const tabContent = document.getElementById('three-lens-stats-tab-content');
    if (tabContent && this.statsTab === 'timeline') {
      tabContent.innerHTML = this.renderCurrentTabContent();
      this.attachTimelineEvents();
      this.renderTimelineChart();
    }
  }

  private renderTimelineChart(): void {
    const canvas = document.getElementById(
      'three-lens-timeline-chart'
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const visibleCount = this.getTimelineVisibleFrameCount();
    const startIndex = Math.max(
      0,
      this.frameHistory.length - visibleCount - this.timelineOffset
    );
    const endIndex = Math.min(
      this.frameHistory.length,
      startIndex + visibleCount
    );
    const cpuData = this.frameHistory.slice(startIndex, endIndex);
    const gpuData = this.gpuHistory.slice(startIndex, endIndex);
    const spikes = this.detectSpikes(33.33)
      .filter((i) => i >= startIndex && i < endIndex)
      .map((i) => i - startIndex);

    if (cpuData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const { width, height } = rect;
    const padding = { top: 20, bottom: 20, left: 40, right: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Calculate max value
    const maxCpu = Math.max(...cpuData, 16.67);
    const maxGpu = gpuData.length > 0 ? Math.max(...gpuData, 16.67) : 0;
    const maxValue = Math.ceil(Math.max(maxCpu, maxGpu, 33.33) / 8.33) * 8.33;

    const barWidth = chartWidth / cpuData.length;

    // Draw gridlines
    ctx.strokeStyle = 'rgba(45, 55, 72, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const gridValues = [16.67, 33.33, 50, 66.67];
    gridValues.forEach((value) => {
      if (value <= maxValue) {
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Grid label
        ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${value.toFixed(0)}ms`, padding.left - 5, y + 3);
      }
    });

    // Draw 60fps target line
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    const target60Y =
      padding.top + chartHeight - (16.67 / maxValue) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, target60Y);
    ctx.lineTo(width - padding.right, target60Y);
    ctx.stroke();

    // Draw 30fps warning line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    const target30Y =
      padding.top + chartHeight - (33.33 / maxValue) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, target30Y);
    ctx.lineTo(width - padding.right, target30Y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw CPU bars
    cpuData.forEach((value, i) => {
      const x = padding.left + i * barWidth;
      const barHeight = (value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Check if spike, selected, or hovered
      const isSpike = spikes.includes(i);
      const isSelected = this.timelineSelectedFrame === startIndex + i;
      const isHovered = this.timelineHoverIndex === startIndex + i;

      ctx.fillStyle = isSpike
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(96, 165, 250, 0.6)';

      if (isHovered) {
        ctx.fillStyle = 'rgba(147, 197, 253, 1)'; // Lighter blue for hover
      }
      if (isSelected) {
        ctx.fillStyle = 'rgba(96, 165, 250, 1)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth - 1, barHeight);
      }

      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw GPU bars on top (if available)
    if (gpuData.length > 0) {
      gpuData.forEach((value, i) => {
        if (value > 0) {
          const x = padding.left + i * barWidth;
          const barHeight = (value / maxValue) * chartHeight;
          const y = padding.top + chartHeight - barHeight;

          ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
      });
    }

    // Draw frame numbers on x-axis
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    const frameStep = Math.max(1, Math.floor(cpuData.length / 10));
    for (let i = 0; i < cpuData.length; i += frameStep) {
      const x = padding.left + i * barWidth + barWidth / 2;
      ctx.fillText(`${startIndex + i + 1}`, x, height - padding.bottom + 12);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  destroy(): void {
    // Clean up virtual scroller if it exists
    if (this.virtualScroller) {
      this.virtualScroller.dispose();
      this.virtualScroller = null;
    }
    this.root.remove();
    document.getElementById('three-lens-styles')?.remove();
  }

  showPanel(panelId: string): void {
    if (!this.openPanels.has(panelId)) {
      this.openPanel(panelId);
    }
  }

  hidePanel(panelId: string): void {
    this.closePanel(panelId);
  }

  toggle(): void {
    this.menuVisible = !this.menuVisible;
    this.updateMenu();
  }
}
