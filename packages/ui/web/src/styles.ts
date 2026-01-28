/**
 * Shared styles for Web Components
 *
 * @packageDocumentation
 */

/**
 * Base CSS variables for theming
 */
export const CSS_VARIABLES = `
  :host {
    /* Colors */
    --3lens-bg-primary: rgba(30, 30, 30, 0.95);
    --3lens-bg-secondary: rgba(50, 50, 50, 0.9);
    --3lens-bg-hover: rgba(70, 70, 70, 0.9);
    --3lens-border: rgba(255, 255, 255, 0.1);
    --3lens-text-primary: #e0e0e0;
    --3lens-text-secondary: #888888;
    --3lens-text-muted: #666666;
    --3lens-accent: #4a9eff;
    --3lens-accent-hover: #6ab0ff;
    --3lens-error: #ff6b6b;
    --3lens-warning: #ffa500;
    --3lens-success: #4caf50;

    /* Typography */
    --3lens-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --3lens-font-size: 12px;
    --3lens-font-size-sm: 11px;
    --3lens-font-size-lg: 14px;
    --3lens-font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;

    /* Spacing */
    --3lens-spacing-xs: 4px;
    --3lens-spacing-sm: 8px;
    --3lens-spacing-md: 12px;
    --3lens-spacing-lg: 16px;
    --3lens-spacing-xl: 24px;

    /* Borders */
    --3lens-radius-sm: 4px;
    --3lens-radius-md: 8px;
    --3lens-radius-lg: 12px;

    /* Shadows */
    --3lens-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);

    /* Z-index layers */
    --3lens-z-base: 10000;
    --3lens-z-overlay: 10001;
    --3lens-z-modal: 10002;
    --3lens-z-tooltip: 10003;
  }
`;

/**
 * Base element styles
 */
export const BASE_STYLES = `
  ${CSS_VARIABLES}

  :host {
    display: block;
    font-family: var(--3lens-font-family);
    font-size: var(--3lens-font-size);
    color: var(--3lens-text-primary);
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }
`;

/**
 * Header styles (shared between overlay and dock)
 */
export const HEADER_STYLES = `
  .header {
    padding: var(--3lens-spacing-sm) var(--3lens-spacing-md);
    background: var(--3lens-bg-secondary);
    border-bottom: 1px solid var(--3lens-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  }

  .header-title {
    font-weight: 600;
    font-size: var(--3lens-font-size-lg);
    display: flex;
    align-items: center;
    gap: var(--3lens-spacing-sm);
  }

  .header-title svg {
    width: 16px;
    height: 16px;
  }

  .header-actions {
    display: flex;
    gap: var(--3lens-spacing-xs);
  }

  .header-btn {
    background: none;
    border: none;
    color: var(--3lens-text-secondary);
    cursor: pointer;
    padding: var(--3lens-spacing-xs) var(--3lens-spacing-sm);
    border-radius: var(--3lens-radius-sm);
    font-size: var(--3lens-font-size);
    transition: background 0.15s, color 0.15s;
  }

  .header-btn:hover {
    background: var(--3lens-bg-hover);
    color: var(--3lens-text-primary);
  }
`;

/**
 * Content area styles
 */
export const CONTENT_STYLES = `
  .content {
    flex: 1;
    overflow: auto;
    padding: var(--3lens-spacing-md);
  }

  .content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .content::-webkit-scrollbar-track {
    background: transparent;
  }

  .content::-webkit-scrollbar-thumb {
    background: var(--3lens-border);
    border-radius: 4px;
  }

  .content::-webkit-scrollbar-thumb:hover {
    background: var(--3lens-text-muted);
  }
`;

/**
 * Panel tabs styles
 */
export const TABS_STYLES = `
  .tabs {
    display: flex;
    background: var(--3lens-bg-secondary);
    border-bottom: 1px solid var(--3lens-border);
    overflow-x: auto;
  }

  .tab {
    padding: var(--3lens-spacing-sm) var(--3lens-spacing-md);
    background: none;
    border: none;
    color: var(--3lens-text-secondary);
    cursor: pointer;
    font-size: var(--3lens-font-size);
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
  }

  .tab:hover {
    color: var(--3lens-text-primary);
  }

  .tab.active {
    color: var(--3lens-accent);
    border-bottom-color: var(--3lens-accent);
  }
`;

/**
 * Empty state styles
 */
export const EMPTY_STATE_STYLES = `
  .empty-state {
    text-align: center;
    padding: var(--3lens-spacing-xl);
    color: var(--3lens-text-secondary);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: var(--3lens-spacing-md);
    opacity: 0.5;
  }

  .empty-state-title {
    font-size: var(--3lens-font-size-lg);
    margin-bottom: var(--3lens-spacing-sm);
  }

  .empty-state-description {
    font-size: var(--3lens-font-size-sm);
    color: var(--3lens-text-muted);
  }
`;

/**
 * 3Lens logo SVG
 */
export const LOGO_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"/>
  <circle cx="12" cy="12" r="4"/>
  <line x1="12" y1="2" x2="12" y2="6"/>
  <line x1="12" y1="18" x2="12" y2="22"/>
  <line x1="2" y1="12" x2="6" y2="12"/>
  <line x1="18" y1="12" x2="22" y2="12"/>
</svg>
`;
