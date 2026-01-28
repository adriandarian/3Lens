/**
 * ThreeLensOverlay Web Component
 *
 * A floating overlay that appears above the canvas.
 * Convenience wrapper around ThreeLensPanel with mode="overlay".
 *
 * @example
 * ```html
 * <three-lens-overlay></three-lens-overlay>
 * ```
 *
 * @packageDocumentation
 */

import type { Lens } from '@3lens/runtime';
import type { Panel } from '@3lens/ui-core';
import {
  BASE_STYLES,
  HEADER_STYLES,
  CONTENT_STYLES,
  TABS_STYLES,
  EMPTY_STATE_STYLES,
  LOGO_SVG,
} from '../styles';

/**
 * ThreeLensOverlay custom element
 *
 * Attributes:
 * - `x`: initial x position (default: 20)
 * - `y`: initial y position (default: 20)
 * - `width`: panel width in pixels (default: 400)
 * - `height`: panel height in pixels (default: 600)
 * - `z-index`: z-index value (default: 10000)
 *
 * Properties:
 * - `lens`: Lens instance to connect to
 * - `panels`: Array of Panel instances to display
 */
export class ThreeLensOverlay extends HTMLElement {
  static readonly tagName = 'three-lens-overlay';

  private _lens: Lens | null = null;
  private _panels: Panel[] = [];
  private _activePanel: string | null = null;
  private _minimized = false;
  private _shadow: ShadowRoot;
  private _contentEl: HTMLElement | null = null;
  private _tabsEl: HTMLElement | null = null;

  // Dragging state
  private _isDragging = false;
  private _dragStartX = 0;
  private _dragStartY = 0;
  private _dragStartLeft = 0;
  private _dragStartTop = 0;

  static get observedAttributes(): string[] {
    return ['x', 'y', 'width', 'height', 'z-index'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this._render();
    this._setupGlobalListeners();
  }

  disconnectedCallback(): void {
    this._panels.forEach((p) => p.dispose?.());
    this._panels = [];
    this._removeGlobalListeners();
  }

  attributeChangedCallback(): void {
    this._render();
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
    this.hidden ? this.show() : this.hide();
  }

  minimize(): void {
    this._minimized = true;
    this._updateMinimizedState();
    this.dispatchEvent(new CustomEvent('minimize'));
  }

  restore(): void {
    this._minimized = false;
    this._updateMinimizedState();
    this.dispatchEvent(new CustomEvent('restore'));
  }

  private _render(): void {
    const x = parseInt(this.getAttribute('x') || '20', 10);
    const y = parseInt(this.getAttribute('y') || '20', 10);
    const width = parseInt(this.getAttribute('width') || '400', 10);
    const height = parseInt(this.getAttribute('height') || '600', 10);
    const zIndex = parseInt(this.getAttribute('z-index') || '10000', 10);

    this._shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
        ${HEADER_STYLES}
        ${CONTENT_STYLES}
        ${TABS_STYLES}
        ${EMPTY_STATE_STYLES}

        :host {
          position: fixed;
          top: ${y}px;
          left: ${x}px;
          width: ${width}px;
          height: ${height}px;
          z-index: ${zIndex};
        }

        .overlay {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          background: var(--3lens-bg-primary);
          border: 1px solid var(--3lens-border);
          border-radius: var(--3lens-radius-md);
          box-shadow: var(--3lens-shadow-lg);
          overflow: hidden;
        }

        .header {
          cursor: move;
        }

        :host(.minimized) .overlay {
          height: auto;
        }

        :host(.minimized) .content,
        :host(.minimized) .tabs {
          display: none;
        }

        /* Resize handle */
        .resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 16px;
          cursor: se-resize;
          background: linear-gradient(135deg, transparent 50%, var(--3lens-border) 50%);
          border-radius: 0 0 var(--3lens-radius-md) 0;
        }
      </style>

      <div class="overlay" part="overlay">
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
        <div class="resize-handle" part="resize-handle"></div>
      </div>
    `;

    this._contentEl = this._shadow.querySelector('.content');
    this._tabsEl = this._shadow.querySelector('.tabs');

    this._setupEventListeners();
    this._renderTabs();
    this._renderContent();
  }

  private _setupEventListeners(): void {
    // Header dragging
    const header = this._shadow.querySelector('.header') as HTMLElement;
    header?.addEventListener('mousedown', this._onDragStart.bind(this));

    // Minimize
    this._shadow.getElementById('btn-minimize')?.addEventListener('click', () => {
      this._minimized ? this.restore() : this.minimize();
    });

    // Close
    this._shadow.getElementById('btn-close')?.addEventListener('click', () => {
      this.hide();
    });

    // Resize handle
    const resizeHandle = this._shadow.querySelector('.resize-handle') as HTMLElement;
    resizeHandle?.addEventListener('mousedown', this._onResizeStart.bind(this));
  }

  private _setupGlobalListeners(): void {
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
  }

  private _removeGlobalListeners(): void {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  }

  private _onDragStart = (e: MouseEvent): void => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    this._isDragging = true;
    this._dragStartX = e.clientX;
    this._dragStartY = e.clientY;
    this._dragStartLeft = this.offsetLeft;
    this._dragStartTop = this.offsetTop;
    e.preventDefault();
  };

  private _onMouseMove = (e: MouseEvent): void => {
    if (!this._isDragging) return;
    const dx = e.clientX - this._dragStartX;
    const dy = e.clientY - this._dragStartY;
    this.style.left = `${this._dragStartLeft + dx}px`;
    this.style.top = `${this._dragStartTop + dy}px`;
  };

  private _onMouseUp = (): void => {
    this._isDragging = false;
  };

  private _resizing = false;
  private _resizeStartX = 0;
  private _resizeStartY = 0;
  private _resizeStartW = 0;
  private _resizeStartH = 0;

  private _onResizeStart = (e: MouseEvent): void => {
    this._resizing = true;
    this._resizeStartX = e.clientX;
    this._resizeStartY = e.clientY;
    this._resizeStartW = this.offsetWidth;
    this._resizeStartH = this.offsetHeight;
    e.preventDefault();
    e.stopPropagation();

    const onMove = (ev: MouseEvent) => {
      if (!this._resizing) return;
      const dw = ev.clientX - this._resizeStartX;
      const dh = ev.clientY - this._resizeStartY;
      this.style.width = `${Math.max(200, this._resizeStartW + dw)}px`;
      this.style.height = `${Math.max(150, this._resizeStartH + dh)}px`;
    };

    const onUp = () => {
      this._resizing = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

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

    this._tabsEl.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = (tab as HTMLElement).dataset.panelId;
        if (id) this.activePanel = id;
      });
    });
  }

  private _renderContent(): void {
    if (!this._contentEl) return;
    this._contentEl.innerHTML = '';

    if (!this._lens) {
      this._contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔗</div>
          <div class="empty-state-title">No Lens Connected</div>
          <div class="empty-state-description">
            Set the <code>lens</code> property to connect.
          </div>
        </div>
      `;
      return;
    }

    if (this._panels.length === 0) {
      this._contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No Panels</div>
          <div class="empty-state-description">Add panels to get started.</div>
        </div>
      `;
      return;
    }

    const activePanel = this._panels.find((p) => p.id === this._activePanel);
    if (activePanel) {
      const client = this._lens.getClient();
      activePanel.render(this._contentEl, client);
    }
  }

  private _updateMinimizedState(): void {
    if (this._minimized) {
      this.classList.add('minimized');
    } else {
      this.classList.remove('minimized');
    }
  }
}
