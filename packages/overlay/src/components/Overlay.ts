import type { DevtoolProbe, SceneNode, FrameStats } from '@3lens/core';

import { formatNumber, getObjectIcon, getObjectClass } from '../utils/format';
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
  { id: 'stats', title: 'Performance', icon: '⚡', iconClass: 'stats', defaultWidth: 320, defaultHeight: 300 },
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
  private frameHistory: number[] = [];
  private topZIndex = 999997;
  private dragState: { panelId: string; startX: number; startY: number; startPanelX: number; startPanelY: number } | null = null;
  private resizeState: { panelId: string; startX: number; startY: number; startWidth: number; startHeight: number } | null = null;
  private lastStatsUpdate = 0;
  private statsUpdateInterval = 500; // Update stats UI every 500ms (2x per second)

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
        3L
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

    const fps = stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0;

    return `
      <div class="three-lens-stats-grid">
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">FPS</div>
          <div class="three-lens-stat-value">${fps}</div>
        </div>
        <div class="three-lens-stat-card">
          <div class="three-lens-stat-label">Frame Time</div>
          <div class="three-lens-stat-value">${stats.cpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span></div>
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
      </div>
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
    if (content) {
      content.innerHTML = this.renderStatsContent();
      this.renderChart();
    }
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
