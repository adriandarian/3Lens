/**
 * Overlay UI Surface
 *
 * Floating overlay UI that appears above the canvas.
 *
 * @packageDocumentation
 */

import type { UIAdapter, Panel } from './types';
import type { LensClient } from '@3lens/runtime';

/**
 * Overlay configuration
 */
export interface UIOverlayConfig {
  /** Initial position */
  position?: { x: number; y: number };
  /** Initial size */
  size?: { width: number; height: number };
  /** Start minimized */
  minimized?: boolean;
  /** Click-through key */
  clickThroughKey?: string;
  /** Z-index */
  zIndex?: number;
}

/**
 * Create an overlay UI adapter
 */
export function uiOverlay(config: UIOverlayConfig = {}): UIAdapter {
  let container: HTMLElement | null = null;
  let visible = true;
  const panels = new Map<string, Panel>();

  const defaultConfig: Required<UIOverlayConfig> = {
    position: { x: 20, y: 20 },
    size: { width: 400, height: 600 },
    minimized: false,
    clickThroughKey: 'Alt',
    zIndex: 10000,
    ...config,
  };

  return {
    mount(target: HTMLElement) {
      // Create overlay container
      container = document.createElement('div');
      container.id = '3lens-overlay';
      container.style.cssText = `
        position: fixed;
        top: ${defaultConfig.position.y}px;
        left: ${defaultConfig.position.x}px;
        width: ${defaultConfig.size.width}px;
        height: ${defaultConfig.size.height}px;
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        z-index: ${defaultConfig.zIndex};
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        color: #e0e0e0;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      `;

      // Create header
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 8px 12px;
        background: rgba(50, 50, 50, 0.9);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      `;
      header.innerHTML = `
        <span style="font-weight: 600;">3Lens</span>
        <div>
          <button id="3lens-minimize" style="background: none; border: none; color: #888; cursor: pointer; padding: 4px 8px;">−</button>
          <button id="3lens-close" style="background: none; border: none; color: #888; cursor: pointer; padding: 4px 8px;">×</button>
        </div>
      `;

      // Create content area
      const content = document.createElement('div');
      content.id = '3lens-content';
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
      document.body.appendChild(container);

      // Make draggable
      makeDraggable(container, header);

      // Event handlers
      header.querySelector('#3lens-minimize')?.addEventListener('click', () => {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        container!.style.height = content.style.display === 'none' ? 'auto' : `${defaultConfig.size.height}px`;
      });

      header.querySelector('#3lens-close')?.addEventListener('click', () => {
        this.hide();
      });
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

/**
 * Make an element draggable
 */
function makeDraggable(element: HTMLElement, handle: HTMLElement): void {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = element.offsetLeft;
    startTop = element.offsetTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    element.style.left = `${startLeft + dx}px`;
    element.style.top = `${startTop + dy}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

export type { UIOverlayConfig };
