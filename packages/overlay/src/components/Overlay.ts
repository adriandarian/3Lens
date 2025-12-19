import type { DevtoolProbe, SceneNode, FrameStats } from '@3lens/core';

import { formatNumber, getObjectIcon, getObjectClass } from '../utils/format';
import { OVERLAY_STYLES } from '../styles/styles';

export interface OverlayOptions {
  probe: DevtoolProbe;
  position?: 'left' | 'right';
  collapsed?: boolean;
}

/**
 * Main 3Lens Overlay component
 */
export class ThreeLensOverlay {
  private container: HTMLDivElement;
  private probe: DevtoolProbe;
  private collapsed: boolean;
  private activeTab: 'scene' | 'stats' | 'inspector' = 'scene';
  private selectedNodeId: string | null = null;
  private expandedNodes: Set<string> = new Set();
  private latestStats: FrameStats | null = null;
  private frameHistory: number[] = [];

  constructor(options: OverlayOptions) {
    this.probe = options.probe;
    this.collapsed = options.collapsed ?? false;

    // Inject styles
    this.injectStyles();

    // Create container
    this.container = this.createContainer(options.position ?? 'right');

    // Subscribe to probe events
    this.probe.onFrameStats((stats) => {
      this.latestStats = stats;
      this.frameHistory.push(stats.cpuTimeMs);
      if (this.frameHistory.length > 60) this.frameHistory.shift();
      if (this.activeTab === 'stats') this.renderStats();
    });

    this.probe.onSelectionChanged((obj, meta) => {
      this.selectedNodeId = meta?.debugId ?? null;
      if (this.activeTab === 'scene') this.renderTree();
      if (this.activeTab === 'inspector') this.renderInspector();
    });

    // Initial render
    this.render();
  }

  private injectStyles(): void {
    if (document.getElementById('three-lens-styles')) return;

    const style = document.createElement('style');
    style.id = 'three-lens-styles';
    style.textContent = OVERLAY_STYLES;
    document.head.appendChild(style);
  }

  private createContainer(position: 'left' | 'right'): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `three-lens-overlay ${this.collapsed ? 'collapsed' : ''}`;
    container.style[position] = '0';
    if (position === 'left') {
      container.style.right = 'auto';
      container.style.borderLeft = 'none';
      container.style.borderRight = '1px solid var(--3lens-border)';
    }
    document.body.appendChild(container);
    return container;
  }

  private render(): void {
    this.container.innerHTML = `
      ${this.renderToggle()}
      ${this.renderHeader()}
      ${this.renderTabs()}
      <div class="three-lens-content">
        ${this.renderActivePanel()}
      </div>
    `;
    this.attachEvents();
  }

  private renderToggle(): string {
    return `
      <button class="three-lens-toggle" title="Toggle panel">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    `;
  }

  private renderHeader(): string {
    const connected = this.probe.isConnected();
    return `
      <div class="three-lens-header">
        <div class="three-lens-logo">
          <div class="three-lens-logo-icon">3L</div>
          <span>3Lens</span>
        </div>
        <div class="three-lens-connection">
          <div class="three-lens-connection-dot ${connected ? '' : 'disconnected'}"></div>
          <span>${connected ? 'Connected' : 'Active'}</span>
        </div>
      </div>
    `;
  }

  private renderTabs(): string {
    const tabs = [
      { id: 'scene', label: 'Scene' },
      { id: 'stats', label: 'Stats' },
      { id: 'inspector', label: 'Inspector' },
    ];

    return `
      <div class="three-lens-tabs">
        ${tabs
          .map(
            (tab) => `
          <button 
            class="three-lens-tab ${this.activeTab === tab.id ? 'active' : ''}"
            data-tab="${tab.id}"
          >
            ${tab.label}
          </button>
        `
          )
          .join('')}
      </div>
    `;
  }

  private renderActivePanel(): string {
    switch (this.activeTab) {
      case 'scene':
        return this.renderScenePanel();
      case 'stats':
        return this.renderStatsPanel();
      case 'inspector':
        return this.renderInspectorPanel();
    }
  }

  private renderScenePanel(): string {
    return `
      <div class="three-lens-tree" id="three-lens-tree">
        ${this.renderTree()}
      </div>
    `;
  }

  private renderTree(): string {
    const scenes = this.probe.getObservedScenes();
    if (scenes.length === 0) {
      return `<div class="three-lens-inspector-empty">No scenes observed</div>`;
    }

    // Get latest snapshot
    const snapshot = this.probe.takeSnapshot();
    return snapshot.scenes.map((scene) => this.renderNode(scene, 0)).join('');
  }

  private renderNode(node: SceneNode, depth: number): string {
    const hasChildren = node.children.length > 0;
    const isExpanded = this.expandedNodes.has(node.ref.debugId);
    const isSelected = this.selectedNodeId === node.ref.debugId;

    return `
      <div class="three-lens-node" data-id="${node.ref.debugId}">
        <div class="three-lens-node-header ${isSelected ? 'selected' : ''}">
          <span class="three-lens-node-toggle ${hasChildren ? (isExpanded ? 'expanded' : '') : 'hidden'}">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
              <path d="M2 1L6 4L2 7z"/>
            </svg>
          </span>
          <span class="three-lens-node-icon ${getObjectClass(node.ref.type)}">
            ${getObjectIcon(node.ref.type)}
          </span>
          <span class="three-lens-node-name">${node.ref.name || `<${node.ref.type}>`}</span>
          <span class="three-lens-node-type">${node.ref.type}</span>
        </div>
        ${
          hasChildren && isExpanded
            ? `<div class="three-lens-node-children">
            ${node.children.map((child) => this.renderNode(child, depth + 1)).join('')}
          </div>`
            : ''
        }
      </div>
    `;
  }

  private renderStatsPanel(): string {
    const stats = this.latestStats;
    if (!stats) {
      return `<div class="three-lens-inspector-empty">No frame data yet</div>`;
    }

    const fps = stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0;
    const drawCallsClass = stats.drawCalls > 1000 ? 'warning' : stats.drawCalls > 2000 ? 'error' : '';
    const trianglesClass = stats.triangles > 500000 ? 'warning' : stats.triangles > 1000000 ? 'error' : '';

    return `
      <div class="three-lens-stats">
        <div class="three-lens-stats-grid">
          <div class="three-lens-stat-card">
            <div class="three-lens-stat-label">FPS</div>
            <div class="three-lens-stat-value">${fps}</div>
          </div>
          <div class="three-lens-stat-card">
            <div class="three-lens-stat-label">Frame Time</div>
            <div class="three-lens-stat-value">
              ${stats.cpuTimeMs.toFixed(1)}<span class="three-lens-stat-unit">ms</span>
            </div>
          </div>
          <div class="three-lens-stat-card">
            <div class="three-lens-stat-label">Draw Calls</div>
            <div class="three-lens-stat-value ${drawCallsClass}">${formatNumber(stats.drawCalls)}</div>
          </div>
          <div class="three-lens-stat-card">
            <div class="three-lens-stat-label">Triangles</div>
            <div class="three-lens-stat-value ${trianglesClass}">${formatNumber(stats.triangles)}</div>
          </div>
        </div>
        
        <div class="three-lens-chart">
          <div class="three-lens-chart-header">
            <span class="three-lens-chart-title">Frame Time (ms)</span>
            <span class="three-lens-chart-value">${stats.cpuTimeMs.toFixed(2)}ms</span>
          </div>
          <canvas class="three-lens-chart-canvas" id="three-lens-chart"></canvas>
        </div>

        ${this.renderViolations(stats)}
      </div>
    `;
  }

  private renderViolations(stats: FrameStats): string {
    if (!stats.violations?.length) return '';

    return `
      <div class="three-lens-violations">
        ${stats.violations
          .map(
            (v) => `
          <div class="three-lens-violation ${v.severity}">
            <svg class="three-lens-violation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span class="three-lens-violation-text">${v.message}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  private renderInspectorPanel(): string {
    const selected = this.probe.getSelectedObject();
    if (!selected) {
      return `<div class="three-lens-inspector-empty">Select an object to inspect</div>`;
    }

    return `
      <div class="three-lens-inspector">
        <div class="three-lens-inspector-section">
          <div class="three-lens-section-header">Transform</div>
          <div class="three-lens-section-content">
            ${this.renderVectorProperty('Position', selected.position)}
            ${this.renderVectorProperty('Rotation', selected.rotation, true)}
            ${this.renderVectorProperty('Scale', selected.scale)}
          </div>
        </div>
        
        <div class="three-lens-inspector-section">
          <div class="three-lens-section-header">Properties</div>
          <div class="three-lens-section-content">
            ${this.renderProperty('Visible', selected.visible)}
            ${this.renderProperty('Frustum Culled', selected.frustumCulled)}
            ${this.renderProperty('Render Order', selected.renderOrder)}
          </div>
        </div>
      </div>
    `;
  }

  private renderProperty(name: string, value: unknown): string {
    return `
      <div class="three-lens-property-row">
        <span class="three-lens-property-name">${name}</span>
        <span class="three-lens-property-value">${String(value)}</span>
      </div>
    `;
  }

  private renderVectorProperty(
    name: string,
    vec: { x: number; y: number; z: number },
    isRotation = false
  ): string {
    const multiplier = isRotation ? 180 / Math.PI : 1;
    return `
      <div class="three-lens-property-row">
        <span class="three-lens-property-name">${name}</span>
        <div class="three-lens-vector-inputs">
          <div class="three-lens-vector-input">
            <input type="number" class="three-lens-property-input" value="${(vec.x * multiplier).toFixed(2)}" step="0.1">
            <div class="three-lens-vector-label">X</div>
          </div>
          <div class="three-lens-vector-input">
            <input type="number" class="three-lens-property-input" value="${(vec.y * multiplier).toFixed(2)}" step="0.1">
            <div class="three-lens-vector-label">Y</div>
          </div>
          <div class="three-lens-vector-input">
            <input type="number" class="three-lens-property-input" value="${(vec.z * multiplier).toFixed(2)}" step="0.1">
            <div class="three-lens-vector-label">Z</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderStats(): void {
    const content = this.container.querySelector('.three-lens-content');
    if (content && this.activeTab === 'stats') {
      content.innerHTML = this.renderStatsPanel();
      this.renderChart();
    }
  }

  private renderChart(): void {
    const canvas = document.getElementById('three-lens-chart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw chart
    const { width, height } = rect;
    ctx.clearRect(0, 0, width, height);

    if (this.frameHistory.length < 2) return;

    const maxValue = Math.max(...this.frameHistory, 16.67);
    const barWidth = width / 60;

    // Draw 16.67ms line (60fps target)
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
    ctx.setLineDash([2, 2]);
    const targetY = height - (16.67 / maxValue) * height;
    ctx.beginPath();
    ctx.moveTo(0, targetY);
    ctx.lineTo(width, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bars
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)');
    gradient.addColorStop(1, 'rgba(34, 211, 238, 0.8)');

    ctx.fillStyle = gradient;
    this.frameHistory.forEach((value, i) => {
      const barHeight = (value / maxValue) * height;
      const x = i * barWidth;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    });
  }

  private renderInspector(): void {
    const content = this.container.querySelector('.three-lens-content');
    if (content && this.activeTab === 'inspector') {
      content.innerHTML = this.renderInspectorPanel();
    }
  }

  private attachEvents(): void {
    // Toggle
    this.container.querySelector('.three-lens-toggle')?.addEventListener('click', () => {
      this.collapsed = !this.collapsed;
      this.container.classList.toggle('collapsed', this.collapsed);
    });

    // Tabs
    this.container.querySelectorAll('.three-lens-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        this.activeTab = target.dataset.tab as 'scene' | 'stats' | 'inspector';
        this.render();
      });
    });

    // Tree interaction
    this.container.querySelectorAll('.three-lens-node-header').forEach((header) => {
      header.addEventListener('click', (e) => {
        const node = (e.currentTarget as HTMLElement).parentElement;
        const id = node?.dataset.id;
        if (!id) return;

        // Toggle expand
        const toggle = (e.target as HTMLElement).closest('.three-lens-node-toggle');
        if (toggle && !toggle.classList.contains('hidden')) {
          if (this.expandedNodes.has(id)) {
            this.expandedNodes.delete(id);
          } else {
            this.expandedNodes.add(id);
          }
          this.render();
          return;
        }

        // Select
        this.selectedNodeId = id;
        this.render();
      });
    });

    // Render chart if on stats tab
    if (this.activeTab === 'stats') {
      requestAnimationFrame(() => this.renderChart());
    }
  }

  /**
   * Destroy the overlay
   */
  destroy(): void {
    this.container.remove();
  }

  /**
   * Show the overlay
   */
  show(): void {
    this.collapsed = false;
    this.container.classList.remove('collapsed');
  }

  /**
   * Hide the overlay
   */
  hide(): void {
    this.collapsed = true;
    this.container.classList.add('collapsed');
  }

  /**
   * Toggle the overlay
   */
  toggle(): void {
    if (this.collapsed) {
      this.show();
    } else {
      this.hide();
    }
  }
}
