import type { DevtoolProbe, SceneNode, FrameStats, BenchmarkScore, SceneSnapshot } from '@3lens/core';
import { calculateBenchmarkScore } from '@3lens/core';

import { formatNumber, formatBytes, getObjectIcon, getObjectClass } from '../utils/format';
import { OVERLAY_STYLES } from '../styles/styles';
import { 
  renderMaterialsPanel, attachMaterialsEvents,
  renderGeometryPanel, attachGeometryEvents,
  renderTexturesPanel, attachTexturesEvents,
  renderRenderTargetsPanel, attachRenderTargetsEvents,
  getSharedStyles,
  createDefaultUIState,
  type UIState,
  type PanelContext,
  type PanelCommand,
} from '@3lens/ui';

export interface OverlayOptions {
  probe: DevtoolProbe;
  /**
   * Optional custom panel definitions to register at startup.
   *
   * Panels registered here will appear alongside the built-in Scene and
   * Performance panels in the overlay menu.
   */
  panels?: OverlayPanelDefinition[];
}

export interface OverlayPanelState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
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

const SCENE_PANEL_WIDTH_COLLAPSED = 320; // Tree only (no selection)
const SCENE_PANEL_WIDTH_EXPANDED = 560;  // Tree + Inspector (with selection)
const SCENE_PANEL_MAX_HEIGHT = 450;      // Max auto-height before scrolling

const DEFAULT_PANELS: OverlayPanelDefinition[] = [
  { id: 'scene', title: 'Scene', icon: 'S', iconClass: 'scene', defaultWidth: SCENE_PANEL_WIDTH_COLLAPSED, defaultHeight: 0 }, // 0 = auto height
  { id: 'stats', title: 'Performance', icon: '⚡', iconClass: 'stats', defaultWidth: 360, defaultHeight: 480 },
  { id: 'materials', title: 'Materials', icon: '🎨', iconClass: 'materials', defaultWidth: 700, defaultHeight: 500 },
  { id: 'geometry', title: 'Geometry', icon: '📐', iconClass: 'inspector', defaultWidth: 750, defaultHeight: 500 },
  { id: 'textures', title: 'Textures', icon: '🖼️', iconClass: 'textures', defaultWidth: 800, defaultHeight: 520 },
  { id: 'render-targets', title: 'Render Targets', icon: '🎯', iconClass: 'render-targets', defaultWidth: 850, defaultHeight: 550 },
];

/**
 * 3Lens Floating Panel Overlay
 */
export class ThreeLensOverlay {
  private root: HTMLDivElement;
  private probe: DevtoolProbe;
  private menuVisible = false;
  private openPanels: Map<string, PanelState> = new Map();
  private selectedNodeId: string | null = null;
  private expandedNodes: Set<string> = new Set();
  private latestStats: FrameStats | null = null;
  private latestBenchmark: BenchmarkScore | null = null;
  private latestSnapshot: SceneSnapshot | null = null;
  private frameHistory: number[] = [];
  private fpsHistory: number[] = [];
  private topZIndex = 999997;
  private dragState: { panelId: string; startX: number; startY: number; startPanelX: number; startPanelY: number } | null = null;
  private resizeState: { panelId: string; startX: number; startY: number; startWidth: number; startHeight: number } | null = null;
  private lastStatsUpdate = 0;
  private statsUpdateInterval = 500; // Update stats UI every 500ms (2x per second)
  private statsTab: 'overview' | 'memory' | 'rendering' = 'overview';
  private panelDefinitions: Map<string, OverlayPanelDefinition> = new Map();
  private panelContexts: Map<string, OverlayPanelContext> = new Map();
  
  // Shared UI state for Materials, Geometry, Textures panels
  private uiState: UIState = createDefaultUIState();
  
  // Chart state
  private chartZoom = 1; // 1 = show all 60 frames, 2 = show 30, etc.
  private chartOffset = 0; // Pan offset (0 = showing latest frames)
  private chartHoverIndex: number | null = null;
  private chartDragging = false;
  private chartDragStartX = 0;
  private chartDragStartOffset = 0;
  private maxHistoryLength = 120; // Store more history for zoom

  constructor(options: OverlayOptions) {
    this.probe = options.probe;

    // Inject styles
    this.injectStyles();

    // Create root
    this.root = document.createElement('div');
    this.root.className = 'three-lens-root';
    document.body.appendChild(this.root);

    // Register panel definitions (built-in + custom)
    this.initializePanelDefinitions(options.panels);

    // Subscribe to probe events (throttled updates)
    this.probe.onFrameStats((stats) => {
      this.latestStats = stats;
      this.frameHistory.push(stats.cpuTimeMs);
      if (this.frameHistory.length > this.maxHistoryLength) this.frameHistory.shift();
      
      // Track FPS history
      const fps = stats.cpuTimeMs > 0 ? 1000 / stats.cpuTimeMs : 0;
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.maxHistoryLength) this.fpsHistory.shift();
      
      // Calculate benchmark score
      this.latestBenchmark = calculateBenchmarkScore(stats);
      
      // Throttle UI updates to prevent flickering
      const now = performance.now();
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

    // Initial render
    this.render();

    // Global event listeners
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private injectStyles(): void {
    if (document.getElementById('three-lens-styles')) return;
    const style = document.createElement('style');
    style.id = 'three-lens-styles';
    // Combine overlay styles with shared panel styles
    style.textContent = OVERLAY_STYLES + '\n' + getSharedStyles();
    document.head.appendChild(style);
  }

  private render(): void {
    this.root.innerHTML = `
      ${this.renderFAB()}
      ${this.renderMenu()}
    `;
    this.attachFABEvents();
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
    return this.getPanelDefinitions().map(panel => `
          <button class="three-lens-menu-item ${this.openPanels.has(panel.id) ? 'active' : ''}" data-panel="${panel.id}">
            <span class="three-lens-menu-icon ${panel.iconClass}">${panel.icon}</span>
            <span>${panel.title}</span>
          </button>
        `).join('');
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
      if (this.menuVisible && !(e.target as HTMLElement).closest('.three-lens-menu, .three-lens-fab')) {
        this.menuVisible = false;
        this.updateMenu();
      }
    });
  }

  private attachMenuItemEvents(container: ParentNode = document): void {
    container.querySelectorAll('.three-lens-menu-item').forEach(item => {
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
    if (fab) fab.className = `three-lens-fab ${this.menuVisible ? 'active' : ''}`;
    if (menu) menu.className = `three-lens-menu ${this.menuVisible ? 'visible' : ''}`;

    // Update active states
    document.querySelectorAll('.three-lens-menu-item').forEach(item => {
      const panelId = (item as HTMLElement).dataset.panel;
      if (panelId) {
        item.classList.toggle('active', this.openPanels.has(panelId));
      }
    });
  }

  private initializePanelDefinitions(customPanels?: OverlayPanelDefinition[]): void {
    [...DEFAULT_PANELS, ...(customPanels ?? [])].forEach((panel) => this.registerPanelDefinition(panel));
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
    const menu = document.getElementById('three-lens-menu');
    if (!menu) return;
    menu.innerHTML = `
        <div class="three-lens-menu-header">Panels</div>
        ${this.renderMenuItems()}
      `;
    this.attachMenuItemEvents(menu);
    this.updateMenu();
  }

  // ═══════════════════════════════════════════════════════════════
  // PANEL MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  private togglePanel(panelId: string): void {
    if (this.openPanels.has(panelId)) {
      this.closePanel(panelId);
    } else {
      this.openPanel(panelId);
    }
  }

  private openPanel(panelId: string): void {
    const config = this.panelDefinitions.get(panelId);
    if (!config) return;

    // Calculate position (cascade)
    const offset = this.openPanels.size * 30;
    const state: PanelState = {
      id: panelId,
      x: 100 + offset,
      y: 100 + offset,
      width: config.defaultWidth,
      height: config.defaultHeight,
      minimized: false,
      zIndex: ++this.topZIndex,
    };

    this.openPanels.set(panelId, state);
    this.createPanelElement(config, state);
    this.updateMenu();
  }

  private closePanel(panelId: string): void {
    this.destroyPanel(panelId);
    this.updateMenu();
  }

  private createPanelElement(config: OverlayPanelDefinition, state: PanelState): void {
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
    const searchPlaceholder = config.id === 'materials' ? 'Search materials...' 
      : config.id === 'geometry' ? 'Search geometry...' 
      : 'Search textures...';
    
    panel.innerHTML = `
      <div class="three-lens-panel-header" data-panel="${config.id}">
        <span class="three-lens-panel-icon ${config.iconClass}">${config.icon}</span>
        <span class="three-lens-panel-title">${config.title}</span>
        ${hasSearch ? `
          <div class="three-lens-header-search">
            <input 
              type="text" 
              class="header-search-input" 
              data-panel="${config.id}"
              placeholder="${searchPlaceholder}" 
            />
          </div>
        ` : ''}
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
        this.probe.updateMaterialProperty(command.materialUuid, command.property, command.value);
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
    return renderRenderTargetsPanel(this.buildSharedPanelContext(), this.uiState);
  }

  private mountPanel(panelId: string, panelElement: HTMLElement): void {
    const definition = this.panelDefinitions.get(panelId);
    const container = panelElement.querySelector(`#three-lens-content-${panelId}`) as HTMLElement | null;
    if (!definition || !container) return;

    const state = this.openPanels.get(panelId);
    const context = this.buildPanelContext(panelId, container, panelElement, state);
    this.panelContexts.set(panelId, context);

    const content = this.renderPanelContent(panelId, context);
    this.applyPanelContent(container, content);
    definition.onMount?.(context);
  }

  private applyPanelContent(container: HTMLElement, content: string | HTMLElement | void): void {
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

  private destroyPanel(panelId: string): void {
    const definition = this.panelDefinitions.get(panelId);
    const context = this.panelContexts.get(panelId);
    if (definition?.onDestroy && context) {
      definition.onDestroy(context);
    }
    this.panelContexts.delete(panelId);

    const el = document.getElementById(`three-lens-panel-${panelId}`);
    if (el) el.remove();
    this.openPanels.delete(panelId);
  }

  private attachPanelEvents(panel: HTMLElement, panelId: string): void {
    // Header drag
    const header = panel.querySelector('.three-lens-panel-header') as HTMLElement;
    header?.addEventListener('mousedown', (e) => {
      // Don't start drag on buttons or search input
      if ((e.target as HTMLElement).closest('.three-lens-panel-btn')) return;
      if ((e.target as HTMLElement).closest('.three-lens-header-search')) return;
      this.startDrag(panelId, e);
    });
    
    // Header search input
    const headerSearch = panel.querySelector('.header-search-input') as HTMLInputElement;
    if (headerSearch) {
      headerSearch.addEventListener('input', () => {
        const searchKey = panelId === 'materials' ? 'materialsSearch' 
          : panelId === 'geometry' ? 'geometrySearch' 
          : 'texturesSearch';
        this.updateUIState({ [searchKey]: headerSearch.value } as Partial<UIState>);
        this.updatePanelById(panelId);
      });
    }

    // Focus on click
    panel.addEventListener('mousedown', () => {
      this.focusPanel(panelId);
    });

    // Control buttons
    panel.querySelectorAll('.three-lens-panel-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action;
        if (action === 'close') this.closePanel(panelId);
        if (action === 'minimize') this.toggleMinimize(panelId);
      });
    });

    // Resize handle
    const resize = panel.querySelector('.three-lens-panel-resize') as HTMLElement;
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
    const container = panel.querySelector(`#three-lens-content-materials`) as HTMLElement;
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
    const container = panel.querySelector(`#three-lens-content-geometry`) as HTMLElement;
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
    const container = panel.querySelector(`#three-lens-content-textures`) as HTMLElement;
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
    const container = panel.querySelector(`#three-lens-content-render-targets`) as HTMLElement;
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
    const content = document.getElementById('three-lens-content-render-targets');
    if (!content) return;
    
    content.innerHTML = this.renderRenderTargetsContent();
    const panel = document.getElementById('three-lens-panel-render-targets');
    if (panel) this.attachRenderTargetsPanelEvents(panel);
  }
  
  private updatePanelById(panelId: string): void {
    switch (panelId) {
      case 'materials': this.updateMaterialsPanel(); break;
      case 'geometry': this.updateGeometryPanel(); break;
      case 'textures': this.updateTexturesPanel(); break;
      case 'render-targets': this.updateRenderTargetsPanel(); break;
    }
  }

  private focusPanel(panelId: string): void {
    const state = this.openPanels.get(panelId);
    if (!state) return;

    state.zIndex = ++this.topZIndex;
    const el = document.getElementById(`three-lens-panel-${panelId}`);
    if (el) {
      el.style.zIndex = String(state.zIndex);
      document.querySelectorAll('.three-lens-panel').forEach(p => p.classList.remove('focused'));
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

      const dx = e.clientX - this.dragState.startX;
      const dy = e.clientY - this.dragState.startY;

      state.x = Math.max(0, this.dragState.startPanelX + dx);
      state.y = Math.max(0, this.dragState.startPanelY + dy);

      const el = document.getElementById(`three-lens-panel-${this.dragState.panelId}`);
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

      const el = document.getElementById(`three-lens-panel-${this.resizeState.panelId}`);
      if (el) {
        el.style.width = `${state.width}px`;
        el.style.height = `${state.height}px`;
      }
    }
  }

  private handleMouseUp(): void {
    // Remove resizing class when done
    if (this.resizeState) {
      const el = document.getElementById(`three-lens-panel-${this.resizeState.panelId}`);
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

  private renderPanelContent(panelId: string, context?: OverlayPanelContext): string | HTMLElement | void {
    switch (panelId) {
      case 'scene': return this.renderSceneContent();
      case 'stats': return this.renderStatsContent();
      case 'materials': return this.renderMaterialsContent();
      case 'geometry': return this.renderGeometryContent();
      case 'textures': return this.renderTexturesContent();
      case 'render-targets': return this.renderRenderTargetsContent();
      default: {
        const definition = this.panelDefinitions.get(panelId);
        if (definition?.render) {
          if (!context) return '<div class="three-lens-inspector-empty">Panel content</div>';
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

    // Only show split view with inspector when something is selected
    if (selectedNode) {
      return `
        <div class="three-lens-split-view">
          <div class="three-lens-tree-pane">
            <div class="three-lens-tree">${snapshot.scenes.map(scene => this.renderNode(scene)).join('')}</div>
          </div>
          <div class="three-lens-inspector-pane">
            ${this.renderNodeInspector(selectedNode)}
          </div>
        </div>
      `;
    }

    // No selection - show tree only (full width)
    return `
      <div class="three-lens-tree-full">
        <div class="three-lens-tree">${snapshot.scenes.map(scene => this.renderNode(scene)).join('')}</div>
      </div>
    `;
  }

  private renderNode(node: SceneNode): string {
    const hasChildren = node.children.length > 0;
    const isExpanded = this.expandedNodes.has(node.ref.debugId);
    const isSelected = this.selectedNodeId === node.ref.debugId;
    const isVisible = node.visible;

    return `
      <div class="three-lens-node" data-id="${node.ref.debugId}">
        <div class="three-lens-node-header ${isSelected ? 'selected' : ''} ${!isVisible ? 'hidden-object' : ''}">
          <span class="three-lens-node-toggle ${hasChildren ? (isExpanded ? 'expanded' : '') : 'hidden'}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1L6 4L2 7z"/></svg>
          </span>
          <span class="three-lens-node-icon ${getObjectClass(node.ref.type)}">${getObjectIcon(node.ref.type)}</span>
          <span class="three-lens-node-name">${node.ref.name || `<${node.ref.type}>`}</span>
          <span class="three-lens-node-type">${node.ref.type}</span>
          <button class="three-lens-visibility-btn ${isVisible ? 'visible' : 'hidden'}" data-id="${node.ref.debugId}" title="${isVisible ? 'Hide object' : 'Show object'}">
            ${isVisible ? this.getEyeOpenIcon() : this.getEyeClosedIcon()}
          </button>
        </div>
        ${hasChildren && isExpanded ? `<div class="three-lens-node-children">${node.children.map(c => this.renderNode(c)).join('')}</div>` : ''}
      </div>
    `;
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
    const fps = stats.performance?.fps ?? (stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0);
    const fpsSmoothed = stats.performance?.fpsSmoothed ?? fps;
    const fps1Low = stats.performance?.fps1PercentLow ?? 0;

    return `
      <div class="three-lens-tabs" id="three-lens-stats-tabs">
        <button class="three-lens-tab ${this.statsTab === 'overview' ? 'active' : ''}" data-tab="overview">Overview</button>
        <button class="three-lens-tab ${this.statsTab === 'memory' ? 'active' : ''}" data-tab="memory">Memory</button>
        <button class="three-lens-tab ${this.statsTab === 'rendering' ? 'active' : ''}" data-tab="rendering">Rendering</button>
      </div>
      <div class="three-lens-stats-tab-content" id="three-lens-stats-tab-content">
        ${this.statsTab === 'overview' ? this.renderOverviewTab(stats, benchmark, fps, fpsSmoothed, fps1Low) : ''}
        ${this.statsTab === 'memory' ? this.renderMemoryTab(stats) : ''}
        ${this.statsTab === 'rendering' ? this.renderRenderingTab(stats) : ''}
      </div>
    `;
  }

  private renderOverviewTab(stats: FrameStats, benchmark: BenchmarkScore | null, fps: number, fpsSmoothed: number, fps1Low: number): string {
    const budgetUsed = stats.performance?.frameBudgetUsed ?? (stats.cpuTimeMs / 16.67) * 100;
    const isSmooth = stats.performance?.isSmooth ?? (stats.cpuTimeMs <= 18);

    return `
      ${benchmark ? this.renderBenchmarkScore(benchmark) : ''}
      <div class="three-lens-stats-grid">
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">FPS</div>
          <div class="three-lens-stat-value ${fps < 30 ? 'error' : fps < 55 ? 'warning' : ''}">${fps}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Frame Time</div>
          <div class="three-lens-stat-value ${stats.cpuTimeMs > 16.67 ? 'warning' : ''}">${stats.cpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Draw Calls</div>
          <div class="three-lens-stat-value ${stats.drawCalls > 1000 ? 'warning' : ''}">${formatNumber(stats.drawCalls)}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Triangles</div>
          <div class="three-lens-stat-value ${stats.triangles > 500000 ? 'warning' : ''}">${formatNumber(stats.triangles)}</div>
        </div>
      </div>
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
        <div class="three-lens-percentiles">
          <div class="three-lens-percentile">
            <span class="three-lens-percentile-label">Avg FPS:</span>
            <span class="three-lens-percentile-value">${fpsSmoothed}</span>
          </div>
          <div class="three-lens-percentile">
            <span class="three-lens-percentile-label">1% Low:</span>
            <span class="three-lens-percentile-value">${Math.round(fps1Low)}</span>
          </div>
          <div class="three-lens-percentile">
            <span class="three-lens-percentile-label">Budget:</span>
            <span class="three-lens-percentile-value ${budgetUsed > 100 ? 'warning' : ''}">${budgetUsed.toFixed(0)}%</span>
          </div>
        </div>
      </div>
      ${benchmark && benchmark.topIssues.length > 0 ? this.renderIssues(benchmark) : ''}
    `;
  }

  private renderBenchmarkScore(benchmark: BenchmarkScore): string {
    const getBarClass = (score: number) => score >= 80 ? 'good' : score >= 50 ? 'ok' : 'bad';

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
    if (benchmark.topIssues.length === 0 && benchmark.suggestions.length === 0) {
      return '';
    }

    return `
      <div class="three-lens-issues">
        ${benchmark.topIssues.map(issue => `
          <div class="three-lens-issue warning">
            <span class="three-lens-issue-icon">⚠️</span>
            <span class="three-lens-issue-text">${issue}</span>
          </div>
        `).join('')}
        ${benchmark.suggestions.slice(0, 2).map(suggestion => `
          <div class="three-lens-suggestion">
            <span class="three-lens-issue-icon">💡</span>
            <span class="three-lens-suggestion-text">${suggestion}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  private renderMemoryTab(stats: FrameStats): string {
    const memory = stats.memory;
    if (!memory) {
      return `<div class="three-lens-inspector-empty">Memory stats not available</div>`;
    }

    return `
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">GPU Memory</div>
        <div class="three-lens-memory-grid">
          <div class="three-lens-memory-item">
            <div class="three-lens-memory-label">Total GPU</div>
            <div class="three-lens-memory-value">${formatBytes(memory.totalGpuMemory)}</div>
          </div>
          <div class="three-lens-memory-item">
            <div class="three-lens-memory-label">Textures</div>
            <div class="three-lens-memory-value">${formatBytes(memory.textureMemory)}</div>
          </div>
          <div class="three-lens-memory-item">
            <div class="three-lens-memory-label">Geometry</div>
            <div class="three-lens-memory-value">${formatBytes(memory.geometryMemory)}</div>
          </div>
          <div class="three-lens-memory-item">
            <div class="three-lens-memory-label">Render Targets</div>
            <div class="three-lens-memory-value">${formatBytes(memory.renderTargetMemory)}</div>
          </div>
        </div>
      </div>
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
            <div class="three-lens-metric-label">Programs</div>
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
      ${memory.jsHeapSize ? `
        <div class="three-lens-metrics-section">
          <div class="three-lens-metrics-title">JS Heap</div>
          <div class="three-lens-memory-grid">
            <div class="three-lens-memory-item">
              <div class="three-lens-memory-label">Used</div>
              <div class="three-lens-memory-value">${formatBytes(memory.jsHeapSize)}</div>
            </div>
            <div class="three-lens-memory-item">
              <div class="three-lens-memory-label">Limit</div>
              <div class="three-lens-memory-value">${formatBytes(memory.jsHeapLimit ?? 0)}</div>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  private renderRenderingTab(stats: FrameStats): string {
    const rendering = stats.rendering;
    const perf = stats.performance;
    
    if (!rendering) {
      return `<div class="three-lens-inspector-empty">Rendering stats not available</div>`;
    }

    return `
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">Geometry Stats</div>
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
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">Objects</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${stats.objectsVisible}</div>
            <div class="three-lens-metric-label">Visible</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${stats.objectsCulled}</div>
            <div class="three-lens-metric-label">Culled</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.transparentObjects}</div>
            <div class="three-lens-metric-label">Transparent</div>
          </div>
        </div>
      </div>
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">Lighting & Shadows</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.totalLights}</div>
            <div class="three-lens-metric-label">Lights</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.shadowCastingLights}</div>
            <div class="three-lens-metric-label">Shadows</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.shadowMapUpdates}</div>
            <div class="three-lens-metric-label">Updates</div>
          </div>
        </div>
      </div>
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">Animation</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.skinnedMeshes}</div>
            <div class="three-lens-metric-label">Skinned</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.totalBones}</div>
            <div class="three-lens-metric-label">Bones</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.totalInstances}</div>
            <div class="three-lens-metric-label">Instances</div>
          </div>
        </div>
      </div>
      <div class="three-lens-metrics-section">
        <div class="three-lens-metrics-title">State Changes</div>
        <div class="three-lens-metrics-grid">
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.programSwitches}</div>
            <div class="three-lens-metric-label">Programs</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.textureBinds}</div>
            <div class="three-lens-metric-label">Textures</div>
          </div>
          <div class="three-lens-metric">
            <div class="three-lens-metric-value">${rendering.renderTargetSwitches}</div>
            <div class="three-lens-metric-label">RT Switch</div>
          </div>
        </div>
      </div>
      ${rendering.xrActive ? `
        <div class="three-lens-metrics-section">
          <div class="three-lens-metrics-title">XR Mode</div>
          <div class="three-lens-metrics-grid">
            <div class="three-lens-metric">
              <div class="three-lens-metric-value">✓</div>
              <div class="three-lens-metric-label">Active</div>
            </div>
            <div class="three-lens-metric">
              <div class="three-lens-metric-value">${rendering.viewports}</div>
              <div class="three-lens-metric-label">Viewports</div>
            </div>
          </div>
        </div>
      ` : ''}
    `;
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
    const toDeg = (r: number) => (r * 180 / Math.PI).toFixed(2);
    
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
      <div class="three-lens-section">
        <div class="three-lens-section-header">Rendering</div>
        ${this.renderProp('Layers', this.formatLayers(node.layers))}
        ${this.renderProp('Render Order', node.renderOrder)}
        ${this.renderProp('Frustum Culled', node.frustumCulled)}
        ${this.renderProp('Children', node.children.length)}
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
    `;
  }

  private renderLightInfo(lightData: NonNullable<SceneNode['lightData']>): string {
    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Light</div>
        ${this.renderProp('Light Type', lightData.lightType)}
        ${this.renderProp('Color', '#' + lightData.color.toString(16).padStart(6, '0').toUpperCase())}
        ${this.renderProp('Intensity', lightData.intensity.toFixed(2))}
        ${this.renderProp('Cast Shadow', lightData.castShadow)}
        ${lightData.distance !== undefined ? this.renderProp('Distance', lightData.distance) : ''}
        ${lightData.angle !== undefined ? this.renderProp('Angle', (lightData.angle * 180 / Math.PI).toFixed(1) + '°') : ''}
      </div>
    `;
  }

  private renderCameraInfo(cameraData: NonNullable<SceneNode['cameraData']>): string {
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

  private renderVectorProp(name: string, vec: { x: number; y: number; z: number }, isRotation = false): string {
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
      tabContent.innerHTML = this.renderCurrentTabContent();
      if (this.statsTab === 'overview') {
        this.attachChartEvents();
        this.renderChart();
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
      }
    }
  }

  private renderCurrentTabContent(): string {
    const stats = this.latestStats;
    if (!stats) {
      return `<div class="three-lens-inspector-empty">Waiting for frame data...</div>`;
    }

    const benchmark = this.latestBenchmark;
    const fps = stats.performance?.fps ?? (stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0);
    const fpsSmoothed = stats.performance?.fpsSmoothed ?? fps;
    const fps1Low = stats.performance?.fps1PercentLow ?? 0;

    switch (this.statsTab) {
      case 'overview':
        return this.renderOverviewTab(stats, benchmark, fps, fpsSmoothed, fps1Low);
      case 'memory':
        return this.renderMemoryTab(stats);
      case 'rendering':
        return this.renderRenderingTab(stats);
      default:
        return '';
    }
  }

  private attachStatsTabEvents(container: HTMLElement): void {
    container.querySelectorAll('.three-lens-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = (e.currentTarget as HTMLElement).dataset.tab as 'overview' | 'memory' | 'rendering';
        if (tabName && tabName !== this.statsTab) {
          this.statsTab = tabName;
          // Update tab active states
          container.querySelectorAll('.three-lens-tab').forEach(t => {
            t.classList.toggle('active', (t as HTMLElement).dataset.tab === tabName);
          });
          // Update content
          const tabContent = document.getElementById('three-lens-stats-tab-content');
          if (tabContent) {
            tabContent.innerHTML = this.renderCurrentTabContent();
            if (this.statsTab === 'overview') {
              this.attachChartEvents();
              this.renderChart();
            }
          }
        }
      });
    });
  }

  private updateScenePanel(): void {
    const content = document.getElementById('three-lens-content-scene');
    if (content) {
      content.innerHTML = this.renderSceneContent();
      const panel = document.getElementById('three-lens-panel-scene');
      if (panel) this.attachTreeEvents(panel);
    }
  }

  private updateInspectorPanel(): void {
    // Since the layout changes between full-width tree and split view,
    // we need to re-render the entire scene panel when selection changes
    this.updateScenePanel();
    
    // Dynamically resize the scene panel based on selection
    this.updateScenePanelSize();
  }

  private updateScenePanelSize(): void {
    const panel = document.getElementById('three-lens-panel-scene');
    const state = this.openPanels.get('scene');
    if (!panel || !state) return;

    const targetWidth = this.selectedNodeId 
      ? SCENE_PANEL_WIDTH_EXPANDED 
      : SCENE_PANEL_WIDTH_COLLAPSED;

    // Only update if width is different
    if (state.width !== targetWidth) {
      state.width = targetWidth;
      panel.style.width = `${targetWidth}px`;
    }
  }

  private attachTreeEvents(panel: HTMLElement): void {
    // Visibility toggle buttons (eye icons)
    panel.querySelectorAll('.three-lens-visibility-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger node selection
        const id = (btn as HTMLElement).dataset.id;
        if (id) {
          this.toggleObjectVisibility(id);
        }
      });
    });

    // Tree node events
    panel.querySelectorAll('.three-lens-node-header').forEach(header => {
      header.addEventListener('click', (e) => {
        // Ignore if clicking visibility button
        if ((e.target as HTMLElement).closest('.three-lens-visibility-btn')) {
          return;
        }

        const node = (header as HTMLElement).parentElement;
        const id = node?.dataset.id;
        if (!id) return;

        const toggle = (e.target as HTMLElement).closest('.three-lens-node-toggle');
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
    const variance = data.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.length;
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
      this.chartOffset = Math.max(0, Math.min(this.chartOffset, this.frameHistory.length - this.getVisibleFrameCount()));
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
    if (jitterEl) jitterEl.textContent = `${this.getFrameTimeJitter().toFixed(1)}ms`;
  }

  private attachChartEvents(): void {
    const container = document.getElementById('three-lens-chart-container');
    const canvas = document.getElementById('three-lens-stats-chart') as HTMLCanvasElement;
    const tooltip = document.getElementById('three-lens-chart-tooltip');
    
    if (!container || !canvas) return;

    // Zoom controls
    document.getElementById('three-lens-chart-zoom-in')?.addEventListener('click', () => this.handleChartZoomIn());
    document.getElementById('three-lens-chart-zoom-out')?.addEventListener('click', () => this.handleChartZoomOut());
    document.getElementById('three-lens-chart-reset')?.addEventListener('click', () => this.handleChartReset());

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
        const framesPerPixel = visibleCount / (canvas.getBoundingClientRect().width);
        const offsetDelta = Math.round(dx * framesPerPixel);
        const maxOffset = Math.max(0, this.frameHistory.length - visibleCount);
        this.chartOffset = Math.max(0, Math.min(maxOffset, this.chartDragStartOffset - offsetDelta));
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
    const canvas = document.getElementById('three-lens-stats-chart') as HTMLCanvasElement;
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
    gridValues.forEach(value => {
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
    const target60Y = padding.top + chartHeight - (16.67 / maxValue) * chartHeight;
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
      ctx.quadraticCurveTo(x + actualBarWidth, y, x + actualBarWidth, y + radius);
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

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  destroy(): void {
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
