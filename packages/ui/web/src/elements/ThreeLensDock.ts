/**
 * ThreeLensDock Web Component
 *
 * A docked panel that renders inside a layout container.
 *
 * @example
 * ```html
 * <div class="app-layout">
 *   <main class="canvas-container">...</main>
 *   <three-lens-dock position="right" width="350"></three-lens-dock>
 * </div>
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
 * Dock position
 */
export type DockPosition = 'left' | 'right' | 'bottom';

/**
 * ThreeLensDock custom element
 *
 * Attributes:
 * - `position`: 'left' | 'right' | 'bottom' (default: 'right')
 * - `width`: width for left/right docks (default: 350)
 * - `height`: height for bottom dock (default: 300)
 * - `resizable`: enable resize handle (boolean attribute)
 * - `collapsible`: enable collapse functionality (boolean attribute)
 *
 * Properties:
 * - `lens`: Lens instance to connect to
 * - `panels`: Array of Panel instances to display
 */
export class ThreeLensDock extends HTMLElement {
  static readonly tagName = 'three-lens-dock';

  private _lens: Lens | null = null;
  private _panels: Panel[] = [];
  private _activePanel: string | null = null;
  private _collapsed = false;
  private _shadow: ShadowRoot;
  private _contentEl: HTMLElement | null = null;
  private _tabsEl: HTMLElement | null = null;

  static get observedAttributes(): string[] {
    return ['position', 'width', 'height', 'resizable', 'collapsible'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this._render();
  }

  disconnectedCallback(): void {
    this._panels.forEach((p) => p.dispose?.());
    this._panels = [];
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

  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    this._collapsed = value;
    this._updateCollapsedState();
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

  expand(): void {
    this._collapsed = false;
    this._updateCollapsedState();
    this.dispatchEvent(new CustomEvent('expand'));
  }

  collapse(): void {
    this._collapsed = true;
    this._updateCollapsedState();
    this.dispatchEvent(new CustomEvent('collapse'));
  }

  toggleCollapse(): void {
    this._collapsed ? this.expand() : this.collapse();
  }

  private _render(): void {
    const position = (this.getAttribute('position') || 'right') as DockPosition;
    const width = parseInt(this.getAttribute('width') || '350', 10);
    const height = parseInt(this.getAttribute('height') || '300', 10);
    const resizable = this.hasAttribute('resizable');
    const collapsible = this.hasAttribute('collapsible');

    const isVertical = position === 'left' || position === 'right';
    const borderSide = position === 'left' ? 'right' : position === 'right' ? 'left' : 'top';

    this._shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
        ${HEADER_STYLES}
        ${CONTENT_STYLES}
        ${TABS_STYLES}
        ${EMPTY_STATE_STYLES}

        :host {
          display: flex;
          flex-direction: column;
          ${isVertical ? `width: ${width}px; height: 100%;` : `height: ${height}px; width: 100%;`}
          background: var(--3lens-bg-primary);
          border-${borderSide}: 1px solid var(--3lens-border);
          position: relative;
        }

        :host(.collapsed) {
          ${isVertical ? 'width: 40px;' : 'height: 40px;'}
        }

        :host(.collapsed) .content,
        :host(.collapsed) .tabs,
        :host(.collapsed) .header-title span {
          display: none;
        }

        :host(.collapsed) .header {
          ${isVertical ? 'writing-mode: vertical-rl; text-orientation: mixed;' : ''}
          justify-content: center;
        }

        .dock {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        ${
          resizable
            ? `
        .resize-handle {
          position: absolute;
          ${position === 'left' ? 'right: 0; top: 0; width: 4px; height: 100%; cursor: ew-resize;' : ''}
          ${position === 'right' ? 'left: 0; top: 0; width: 4px; height: 100%; cursor: ew-resize;' : ''}
          ${position === 'bottom' ? 'top: 0; left: 0; height: 4px; width: 100%; cursor: ns-resize;' : ''}
          background: transparent;
          transition: background 0.15s;
        }

        .resize-handle:hover {
          background: var(--3lens-accent);
        }
        `
            : ''
        }

        ${
          collapsible
            ? `
        .collapse-btn {
          background: none;
          border: none;
          color: var(--3lens-text-secondary);
          cursor: pointer;
          padding: var(--3lens-spacing-xs);
          border-radius: var(--3lens-radius-sm);
        }

        .collapse-btn:hover {
          background: var(--3lens-bg-hover);
          color: var(--3lens-text-primary);
        }
        `
            : ''
        }
      </style>

      <div class="dock" part="dock">
        <div class="header" part="header">
          <span class="header-title">
            ${LOGO_SVG}
            <span>3Lens</span>
          </span>
          <div class="header-actions">
            ${collapsible ? `<button class="collapse-btn" id="btn-collapse" title="Collapse">${this._getCollapseIcon(position)}</button>` : ''}
          </div>
        </div>
        <div class="tabs" part="tabs"></div>
        <div class="content" part="content"></div>
        ${resizable ? `<div class="resize-handle" part="resize-handle"></div>` : ''}
      </div>
    `;

    this._contentEl = this._shadow.querySelector('.content');
    this._tabsEl = this._shadow.querySelector('.tabs');

    this._setupEventListeners();
    this._renderTabs();
    this._renderContent();
  }

  private _getCollapseIcon(position: DockPosition): string {
    const icons = {
      left: this._collapsed ? '→' : '←',
      right: this._collapsed ? '←' : '→',
      bottom: this._collapsed ? '↑' : '↓',
    };
    return icons[position];
  }

  private _setupEventListeners(): void {
    // Collapse button
    this._shadow.getElementById('btn-collapse')?.addEventListener('click', () => {
      this.toggleCollapse();
    });

    // Resize handle
    const resizeHandle = this._shadow.querySelector('.resize-handle') as HTMLElement;
    if (resizeHandle) {
      this._setupResize(resizeHandle);
    }
  }

  private _setupResize(handle: HTMLElement): void {
    const position = this.getAttribute('position') || 'right';
    const isVertical = position === 'left' || position === 'right';

    let isResizing = false;
    let startPos = 0;
    let startSize = 0;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startPos = isVertical ? e.clientX : e.clientY;
      startSize = isVertical ? this.offsetWidth : this.offsetHeight;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const currentPos = isVertical ? e.clientX : e.clientY;
      let delta = currentPos - startPos;

      // Invert delta for right/bottom positions
      if (position === 'right' || position === 'bottom') {
        delta = -delta;
      }

      const newSize = Math.max(200, startSize + delta);

      if (isVertical) {
        this.style.width = `${newSize}px`;
      } else {
        this.style.height = `${newSize}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
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

  private _updateCollapsedState(): void {
    if (this._collapsed) {
      this.classList.add('collapsed');
    } else {
      this.classList.remove('collapsed');
    }

    // Update collapse button icon
    const btn = this._shadow.getElementById('btn-collapse');
    if (btn) {
      const position = (this.getAttribute('position') || 'right') as DockPosition;
      btn.textContent = this._getCollapseIcon(position);
    }
  }
}
