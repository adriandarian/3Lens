import type { DevtoolProbe, SceneNode, FrameStats, BenchmarkScore } from '@3lens/core';
import { calculateBenchmarkScore } from '@3lens/core';

import { formatNumber, formatBytes, getObjectIcon, getObjectClass } from '../utils/format';
import { OVERLAY_STYLES } from '../styles/styles';

export interface OverlayOptions {
  probe: DevtoolProbe;
}

interface PanelConfig {
  id: string;
  title: string;
  icon: string;
  iconClass: string;
  defaultWidth: number;
  defaultHeight: number;
}

interface PanelState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
}

const PANELS: PanelConfig[] = [
  { id: 'scene', title: 'Scene Graph', icon: 'S', iconClass: 'scene', defaultWidth: 300, defaultHeight: 400 },
  { id: 'stats', title: 'Performance', icon: '⚡', iconClass: 'stats', defaultWidth: 360, defaultHeight: 480 },
  { id: 'inspector', title: 'Inspector', icon: 'I', iconClass: 'inspector', defaultWidth: 300, defaultHeight: 350 },
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
  private frameHistory: number[] = [];
  private fpsHistory: number[] = [];
  private topZIndex = 999997;
  private dragState: { panelId: string; startX: number; startY: number; startPanelX: number; startPanelY: number } | null = null;
  private resizeState: { panelId: string; startX: number; startY: number; startWidth: number; startHeight: number } | null = null;
  private lastStatsUpdate = 0;
  private statsUpdateInterval = 500; // Update stats UI every 500ms (2x per second)
  private statsTab: 'overview' | 'memory' | 'rendering' = 'overview';

  constructor(options: OverlayOptions) {
    this.probe = options.probe;

    // Inject styles
    this.injectStyles();

    // Create root
    this.root = document.createElement('div');
    this.root.className = 'three-lens-root';
    document.body.appendChild(this.root);

    // Subscribe to probe events (throttled updates)
    this.probe.onFrameStats((stats) => {
      this.latestStats = stats;
      this.frameHistory.push(stats.cpuTimeMs);
      if (this.frameHistory.length > 60) this.frameHistory.shift();
      
      // Track FPS history
      const fps = stats.cpuTimeMs > 0 ? 1000 / stats.cpuTimeMs : 0;
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) this.fpsHistory.shift();
      
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
    style.textContent = OVERLAY_STYLES;
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
        ${PANELS.map(panel => `
          <button class="three-lens-menu-item ${this.openPanels.has(panel.id) ? 'active' : ''}" data-panel="${panel.id}">
            <span class="three-lens-menu-icon ${panel.iconClass}">${panel.icon}</span>
            <span>${panel.title}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  private attachFABEvents(): void {
    const fab = document.getElementById('three-lens-fab');
    fab?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.menuVisible = !this.menuVisible;
      this.updateMenu();
    });

    // Menu items
    document.querySelectorAll('.three-lens-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const panelId = (e.currentTarget as HTMLElement).dataset.panel;
        if (panelId) {
          this.togglePanel(panelId);
          this.menuVisible = false;
          this.updateMenu();
        }
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this.menuVisible && !(e.target as HTMLElement).closest('.three-lens-menu, .three-lens-fab')) {
        this.menuVisible = false;
        this.updateMenu();
      }
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
    const config = PANELS.find(p => p.id === panelId);
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
  }

  private closePanel(panelId: string): void {
    const el = document.getElementById(`three-lens-panel-${panelId}`);
    if (el) el.remove();
    this.openPanels.delete(panelId);
  }

  private createPanelElement(config: PanelConfig, state: PanelState): void {
    const panel = document.createElement('div');
    panel.id = `three-lens-panel-${config.id}`;
    panel.className = 'three-lens-panel';
    panel.style.cssText = `
      left: ${state.x}px;
      top: ${state.y}px;
      width: ${state.width}px;
      height: ${state.height}px;
      z-index: ${state.zIndex};
    `;

    panel.innerHTML = `
      <div class="three-lens-panel-header" data-panel="${config.id}">
        <span class="three-lens-panel-icon ${config.iconClass}">${config.icon}</span>
        <span class="three-lens-panel-title">${config.title}</span>
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
        ${this.renderPanelContent(config.id)}
      </div>
      <div class="three-lens-panel-resize" data-panel="${config.id}"></div>
    `;

    this.root.appendChild(panel);
    this.attachPanelEvents(panel, config.id);
  }

  private attachPanelEvents(panel: HTMLElement, panelId: string): void {
    // Header drag
    const header = panel.querySelector('.three-lens-panel-header') as HTMLElement;
    header?.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).closest('.three-lens-panel-btn')) return;
      this.startDrag(panelId, e);
    });

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

    this.resizeState = {
      panelId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: state.width,
      startHeight: state.height,
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
      state.height = Math.max(200, this.resizeState.startHeight + dy);

      const el = document.getElementById(`three-lens-panel-${this.resizeState.panelId}`);
      if (el) {
        el.style.width = `${state.width}px`;
        el.style.height = `${state.height}px`;
      }
    }
  }

  private handleMouseUp(): void {
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

  private renderPanelContent(panelId: string): string {
    switch (panelId) {
      case 'scene': return this.renderSceneContent();
      case 'stats': return this.renderStatsContent();
      case 'inspector': return this.renderInspectorContent();
      default: return '<div class="three-lens-inspector-empty">Panel content</div>';
    }
  }

  private renderSceneContent(): string {
    const scenes = this.probe.getObservedScenes();
    if (scenes.length === 0) {
      return `<div class="three-lens-inspector-empty">No scenes observed</div>`;
    }

    const snapshot = this.probe.takeSnapshot();
    return `<div class="three-lens-tree">${snapshot.scenes.map(scene => this.renderNode(scene)).join('')}</div>`;
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
          <span class="three-lens-chart-value">${stats.cpuTimeMs.toFixed(2)}ms</span>
        </div>
        <canvas class="three-lens-chart-canvas" id="three-lens-stats-chart"></canvas>
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

  private renderInspectorContent(): string {
    // Try to get from probe first, fall back to finding by debugId
    let selected = this.probe.getSelectedObject();
    
    // If highlight is disabled, we might have a local selection that's not in the probe
    if (!selected && this.selectedNodeId) {
      // Find the object from the snapshot data instead
      const snapshot = this.probe.takeSnapshot();
      const nodeData = this.findNodeById(snapshot.scenes, this.selectedNodeId);
      if (nodeData) {
        return this.renderNodeInspector(nodeData);
      }
    }
    
    if (!selected) {
      return `<div class="three-lens-inspector-empty">Select an object in the Scene panel</div>`;
    }

    return `
      <div class="three-lens-section">
        <div class="three-lens-section-header">Transform</div>
        ${this.renderVectorProp('Position', selected.position)}
        ${this.renderVectorProp('Rotation', selected.rotation, true)}
        ${this.renderVectorProp('Scale', selected.scale)}
      </div>
      <div class="three-lens-section">
        <div class="three-lens-section-header">Properties</div>
        ${this.renderProp('Visible', selected.visible)}
        ${this.renderProp('Frustum Culled', selected.frustumCulled)}
        ${this.renderProp('Render Order', selected.renderOrder)}
        ${this.renderProp('Type', selected.type)}
      </div>
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
      <div class="three-lens-section">
        <div class="three-lens-section-header">Properties</div>
        ${this.renderProp('Name', node.ref.name || '(unnamed)')}
        ${this.renderProp('Type', node.ref.type)}
        ${this.renderProp('Visible', node.visible)}
        ${this.renderProp('Frustum Culled', node.frustumCulled)}
        ${this.renderProp('Render Order', node.renderOrder)}
        ${this.renderProp('Children', node.children.length)}
      </div>
    `;
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
    const content = document.getElementById('three-lens-content-inspector');
    if (content) {
      content.innerHTML = this.renderInspectorContent();
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

        // Select the object in the probe (this triggers onSelectionChanged callback
        // which updates the scene panel, inspector panel, and shows 3D bounding box)
        this.probe.selectByDebugId(id);
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

  private renderChart(): void {
    const canvas = document.getElementById('three-lens-stats-chart') as HTMLCanvasElement;
    if (!canvas || this.frameHistory.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const { width, height } = rect;
    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...this.frameHistory, 16.67);
    const barWidth = width / 60;

    // 60fps target line
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
    ctx.setLineDash([2, 2]);
    const targetY = height - (16.67 / maxValue) * height;
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bars
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)');
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.8)');
    ctx.fillStyle = gradient;

    this.frameHistory.forEach((value, i) => {
      const barHeight = (value / maxValue) * height;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
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
