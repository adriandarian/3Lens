/**
 * Dock UI Surface
 *
 * Docked panel UI that renders inside a host-provided container.
 *
 * @packageDocumentation
 */

import type { UIAdapter, Panel } from './types';

/**
 * Dock configuration
 */
export interface UIDockConfig {
  /** Target container element */
  target: HTMLElement;
  /** Dock position */
  position?: 'left' | 'right' | 'bottom';
  /** Initial size */
  size?: number;
  /** Resizable */
  resizable?: boolean;
}

/**
 * Create a dock UI adapter
 */
export function uiDock(config: UIDockConfig): UIAdapter {
  let container: HTMLElement | null = null;
  let visible = true;
  const panels = new Map<string, Panel>();

  const defaultConfig = {
    position: 'right' as const,
    size: 300,
    resizable: true,
    ...config,
  };

  return {
    mount(target: HTMLElement) {
      container = document.createElement('div');
      container.id = '3lens-dock';

      const isHorizontal = defaultConfig.position === 'bottom';
      const sizeProp = isHorizontal ? 'height' : 'width';

      container.style.cssText = `
        ${sizeProp}: ${defaultConfig.size}px;
        ${isHorizontal ? 'width: 100%' : 'height: 100%'};
        background: rgba(30, 30, 30, 0.98);
        border-${defaultConfig.position === 'left' ? 'right' : defaultConfig.position === 'right' ? 'left' : 'top'}: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        color: #e0e0e0;
        overflow: hidden;
      `;

      // Header
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 8px 12px;
        background: rgba(50, 50, 50, 0.9);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      header.innerHTML = `
        <span style="font-weight: 600;">3Lens</span>
        <button id="3lens-collapse" style="background: none; border: none; color: #888; cursor: pointer;">−</button>
      `;

      // Content
      const content = document.createElement('div');
      content.id = '3lens-dock-content';
      content.style.cssText = `
        flex: 1;
        overflow: auto;
        padding: 12px;
      `;
      content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #888;">
          <p>3Lens Devtools</p>
          <p style="font-size: 11px; margin-top: 8px;">Register a context to begin</p>
        </div>
      `;

      container.appendChild(header);
      container.appendChild(content);
      config.target.appendChild(container);
    },

    unmount() {
      if (container) {
        container.remove();
        container = null;
      }
    },

    show() {
      if (container) {
        container.style.display = 'flex';
        visible = true;
      }
    },

    hide() {
      if (container) {
        container.style.display = 'none';
        visible = false;
      }
    },

    toggle() {
      if (visible) {
        this.hide();
      } else {
        this.show();
      }
    },

    isVisible() {
      return visible;
    },

    registerPanel(panel: Panel) {
      panels.set(panel.id, panel);
    },

    unregisterPanel(panelId: string) {
      panels.delete(panelId);
    },
  };
}

export type { UIDockConfig };
