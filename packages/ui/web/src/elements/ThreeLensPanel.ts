/**
 * ThreeLensPanel Web Component
 *
 * A unified panel element that can render in different modes.
 *
 * @example
 * ```html
 * <three-lens-panel mode="overlay"></three-lens-panel>
 * <three-lens-panel mode="dock" position="right"></three-lens-panel>
 * ```
 *
 * @packageDocumentation
 */

import type { Lens } from '@3lens/runtime';
import type { Panel, UIAdapter } from '@3lens/ui-core';
import {
  BASE_STYLES,
  HEADER_STYLES,
  CONTENT_STYLES,
  TABS_STYLES,
  EMPTY_STATE_STYLES,
  LOGO_SVG,
} from '../styles';

/**
 * Panel mode attribute values
 */
export type PanelMode = 'overlay' | 'dock' | 'inline';

/**
 * ThreeLensPanel custom element
 *
 * Attributes:
 * - `mode`: 'overlay' | 'dock' | 'inline' (default: 'inline')
 * - `position`: dock position 'left' | 'right' | 'bottom' (default: 'right')
 * - `width`: panel width in pixels (default: 400)
 * - `height`: panel height in pixels (default: 600)
 * - `minimized`: start minimized (boolean attribute)
 *
 * Properties:
 * - `lens`: Lens instance to connect to
 * - `panels`: Array of Panel instances to display
 */
export class ThreeLensPanel extends HTMLElement {
  static readonly tagName = 'three-lens-panel';

  private _lens: Lens | null = null;
  private _panels: Panel[] = [];
  private _activePanel: string | null = null;
  private _minimized = false;
  private _shadow: ShadowRoot;
  private _contentEl: HTMLElement | null = null;
  private _tabsEl: HTMLElement | null = null;

  static get observedAttributes(): string[] {
    return ['mode', 'position', 'width', 'height', 'minimized'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  // Lifecycle
  connectedCallback(): void {
    this._minimized = this.hasAttribute('minimized');
    this._render();
  }

  disconnectedCallback(): void {
    // Cleanup
    this._panels.forEach((p) => p.dispose?.());
    this._panels = [];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === 'minimized') {
      this._minimized = newValue !== null;
      this._updateMinimizedState();
    } else {
      this._render();
    }
  }

  // Properties
  get lens(): Lens | null {
    return this._lens;
  }

  set lens(value: Lens | null) {
    this._lens = value;
    this._renderContent();
  }

  get panels(): Panel[] {
    return [...this._panels];
  }

  set panels(value: Panel[]) {
    this._panels = value;
    if (value.length > 0 && !this._activePanel) {
      this._activePanel = value[0].id;
    }
    this._renderTabs();
    this._renderContent();
  }

  get activePanel(): string | null {
    return this._activePanel;
  }

  set activePanel(id: string | null) {
    if (this._activePanel !== id) {
      this._activePanel = id;
      this._renderTabs();
      this._renderContent();
    }
  }

  // Public methods
  addPanel(panel: Panel): void {
    this._panels.push(panel);
    if (!this._activePanel) {
      this._activePanel = panel.id;
    }
    this._renderTabs();
    this._renderContent();
  }

  removePanel(panelId: string): void {
    const idx = this._panels.findIndex((p) => p.id === panelId);
    if (idx >= 0) {
      this._panels[idx].dispose?.();
      this._panels.splice(idx, 1);
      if (this._activePanel === panelId) {
        this._activePanel = this._panels[0]?.id ?? null;
      }
      this._renderTabs();
      this._renderContent();
    }
  }

  show(): void {
    this.hidden = false;
    this.dispatchEvent(new CustomEvent('show'));
  }

  hide(): void {
    this.hidden = true;
    this.dispatchEvent(new CustomEvent('hide'));
  }

  toggle(): void {
    if (this.hidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  minimize(): void {
    this._minimized = true;
    this.setAttribute('minimized', '');
    this._updateMinimizedState();
    this.dispatchEvent(new CustomEvent('minimize'));
  }

  restore(): void {
    this._minimized = false;
    this.removeAttribute('minimized');
    this._updateMinimizedState();
    this.dispatchEvent(new CustomEvent('restore'));
  }

  toggleMinimize(): void {
    if (this._minimized) {
      this.restore();
    } else {
      this.minimize();
    }
  }

  // Private methods
  private _render(): void {
    const mode = this.getAttribute('mode') || 'inline';
    const width = parseInt(this.getAttribute('width') || '400', 10);
    const height = parseInt(this.getAttribute('height') || '600', 10);

    const modeStyles = this._getModeStyles(mode as PanelMode, width, height);

    this._shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
        ${HEADER_STYLES}
        ${CONTENT_STYLES}
        ${TABS_STYLES}
        ${EMPTY_STATE_STYLES}

        :host {
          ${modeStyles}
        }

        .panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--3lens-bg-primary);
          border: 1px solid var(--3lens-border);
          border-radius: var(--3lens-radius-md);
          box-shadow: var(--3lens-shadow);
          overflow: hidden;
        }

        .header {
          cursor: ${mode === 'overlay' ? 'move' : 'default'};
        }

        :host([minimized]) .content,
        :host([minimized]) .tabs {
          display: none;
        }

        :host([minimized]) .panel {
          height: auto;
        }
      </style>

      <div class="panel" part="panel">
        <div class="header" part="header">
          <span class="header-title">
            ${LOGO_SVG}
            <span>3Lens</span>
          </span>
          <div class="header-actions">
            <button class="header-btn" id="btn-minimize" title="Minimize">−</button>
            <button class="header-btn" id="btn-close" title="Close">×</button>
          </div>
        </div>
        <div class="tabs" part="tabs"></div>
        <div class="content" part="content"></div>
      </div>
    `;

    // Cache element references
    this._contentEl = this._shadow.querySelector('.content');
    this._tabsEl = this._shadow.querySelector('.tabs');

    // Setup event listeners
    this._setupEventListeners();

    // Render content
    this._renderTabs();
    this._renderContent();
  }

  private _getModeStyles(mode: PanelMode, width: number, height: number): string {
    switch (mode) {
      case 'overlay':
        return `
          position: fixed;
          top: 20px;
          left: 20px;
          width: ${width}px;
          height: ${height}px;
          z-index: var(--3lens-z-overlay);
        `;
      case 'dock':
        const position = this.getAttribute('position') || 'right';
        return `
          position: absolute;
          ${position}: 0;
          top: 0;
          width: ${width}px;
          height: 100%;
          z-index: var(--3lens-z-base);
        `;
      case 'inline':
      default:
        return `
          width: ${width}px;
          height: ${height}px;
        `;
    }
  }

  private _setupEventListeners(): void {
    const mode = this.getAttribute('mode') || 'inline';

    // Minimize button
    this._shadow.getElementById('btn-minimize')?.addEventListener('click', () => {
      this.toggleMinimize();
    });

    // Close button
    this._shadow.getElementById('btn-close')?.addEventListener('click', () => {
      this.hide();
    });

    // Dragging for overlay mode
    if (mode === 'overlay') {
      this._setupDragging();
    }
  }

  private _setupDragging(): void {
    const header = this._shadow.querySelector('.header') as HTMLElement;
    if (!header) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = this.offsetLeft;
      startTop = this.offsetTop;
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      this.style.left = `${startLeft + dx}px`;
      this.style.top = `${startTop + dy}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private _renderTabs(): void {
    if (!this._tabsEl) return;

    if (this._panels.length === 0) {
      this._tabsEl.style.display = 'none';
      return;
    }

    this._tabsEl.style.display = 'flex';
    this._tabsEl.innerHTML = this._panels
      .map(
        (panel) => `
        <button 
          class="tab ${panel.id === this._activePanel ? 'active' : ''}" 
          data-panel-id="${panel.id}"
        >
          ${panel.name}
        </button>
      `
      )
      .join('');

    // Add click listeners
    this._tabsEl.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = (tab as HTMLElement).dataset.panelId;
        if (id) {
          this.activePanel = id;
          this.dispatchEvent(new CustomEvent('panel-change', { detail: { panelId: id } }));
        }
      });
    });
  }

  private _renderContent(): void {
    if (!this._contentEl) return;

    // Clear previous content
    this._contentEl.innerHTML = '';

    // No lens connected
    if (!this._lens) {
      this._contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔗</div>
          <div class="empty-state-title">No Lens Connected</div>
          <div class="empty-state-description">
            Set the <code>lens</code> property to connect to a 3Lens instance.
          </div>
        </div>
      `;
      return;
    }

    // No panels registered
    if (this._panels.length === 0) {
      this._contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No Panels</div>
          <div class="empty-state-description">
            Add panels using the <code>panels</code> property or <code>addPanel()</code> method.
          </div>
        </div>
      `;
      return;
    }

    // Find active panel
    const activePanel = this._panels.find((p) => p.id === this._activePanel);
    if (!activePanel) {
      this._contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">❓</div>
          <div class="empty-state-title">Panel Not Found</div>
          <div class="empty-state-description">
            The selected panel could not be found.
          </div>
        </div>
      `;
      return;
    }

    // Render the active panel
    const client = this._lens.getClient();
    activePanel.render(this._contentEl, client);
  }

  private _updateMinimizedState(): void {
    const content = this._shadow.querySelector('.content') as HTMLElement;
    const tabs = this._shadow.querySelector('.tabs') as HTMLElement;

    if (content) {
      content.style.display = this._minimized ? 'none' : 'block';
    }
    if (tabs) {
      tabs.style.display = this._minimized ? 'none' : 'flex';
    }
  }
}
