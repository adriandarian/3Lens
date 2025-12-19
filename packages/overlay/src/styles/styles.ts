/**
 * Inline styles for 3Lens overlay - Floating Panel System
 */

export const OVERLAY_STYLES = `
/* 3Lens Theme Variables */
:root {
  --3lens-font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  --3lens-font-sans: 'Geist', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

  --3lens-bg-primary: #0a0e14;
  --3lens-bg-secondary: #0f1419;
  --3lens-bg-tertiary: #151b23;
  --3lens-bg-elevated: #1a222c;
  --3lens-bg-hover: #1f2937;

  --3lens-border: #2d3748;
  --3lens-border-subtle: #1e2738;
  --3lens-border-focus: #3b82f6;

  --3lens-text-primary: #e4e7eb;
  --3lens-text-secondary: #9ca3af;
  --3lens-text-tertiary: #6b7280;
  --3lens-text-disabled: #4b5563;

  --3lens-accent-blue: #60a5fa;
  --3lens-accent-cyan: #22d3ee;
  --3lens-accent-emerald: #34d399;
  --3lens-accent-amber: #fbbf24;
  --3lens-accent-rose: #fb7185;
  --3lens-accent-violet: #a78bfa;

  --3lens-success: #10b981;
  --3lens-warning: #f59e0b;
  --3lens-error: #ef4444;

  --3lens-color-scene: #34d399;
  --3lens-color-mesh: #60a5fa;
  --3lens-color-group: #a78bfa;
  --3lens-color-light: #fbbf24;
  --3lens-color-camera: #f472b6;

  --3lens-radius-sm: 4px;
  --3lens-radius-md: 6px;
  --3lens-radius-lg: 8px;
  --3lens-radius-xl: 12px;

  --3lens-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --3lens-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --3lens-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Reset */
.three-lens-root,
.three-lens-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING ACTION BUTTON (FAB)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--3lens-accent-cyan), var(--3lens-accent-blue));
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--3lens-bg-primary);
  font-weight: 700;
  font-size: 14px;
  font-family: var(--3lens-font-sans);
  box-shadow: var(--3lens-shadow-md), 0 0 20px rgba(34, 211, 238, 0.3);
  z-index: 999998;
  transition: all 150ms ease;
  user-select: none;
}

.three-lens-fab:hover {
  transform: scale(1.1);
  box-shadow: var(--3lens-shadow-lg), 0 0 30px rgba(34, 211, 238, 0.4);
}

.three-lens-fab:active {
  transform: scale(0.95);
}

.three-lens-fab.active {
  background: var(--3lens-bg-elevated);
  color: var(--3lens-accent-cyan);
}

/* ═══════════════════════════════════════════════════════════════
   PANEL MENU (appears when FAB is clicked)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-menu {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-lg);
  padding: 8px;
  min-width: 180px;
  box-shadow: var(--3lens-shadow-lg);
  z-index: 999999;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  pointer-events: none;
  transition: all 150ms ease;
}

.three-lens-menu.visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.three-lens-menu-header {
  padding: 8px 12px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--3lens-text-tertiary);
  border-bottom: 1px solid var(--3lens-border-subtle);
  margin-bottom: 4px;
}

.three-lens-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-sans);
  font-size: 13px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 100ms ease;
}

.three-lens-menu-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-menu-item.active {
  background: rgba(34, 211, 238, 0.1);
  color: var(--3lens-accent-cyan);
}

.three-lens-menu-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.three-lens-menu-icon.scene { background: var(--3lens-color-scene); color: #000; }
.three-lens-menu-icon.stats { background: var(--3lens-accent-cyan); color: #000; }
.three-lens-menu-icon.inspector { background: var(--3lens-accent-blue); color: #000; }
.three-lens-menu-icon.textures { background: var(--3lens-accent-amber); color: #000; }
.three-lens-menu-icon.materials { background: var(--3lens-accent-violet); color: #000; }

/* ═══════════════════════════════════════════════════════════════
   FLOATING PANELS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-panel {
  position: fixed;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-lg);
  box-shadow: var(--3lens-shadow-lg);
  z-index: 999997;
  min-width: 280px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  font-family: var(--3lens-font-sans);
  font-size: 13px;
  color: var(--3lens-text-primary);
  overflow: hidden;
  transition: box-shadow 150ms ease;
}

.three-lens-panel:hover {
  box-shadow: var(--3lens-shadow-lg), 0 0 0 1px var(--3lens-border-focus);
}

.three-lens-panel.focused {
  z-index: 999998;
  box-shadow: var(--3lens-shadow-lg), 0 0 0 2px var(--3lens-accent-cyan);
}

.three-lens-panel.minimized {
  min-height: auto;
  height: auto !important;
}

.three-lens-panel.minimized .three-lens-panel-content {
  display: none;
}

.three-lens-panel.minimized .three-lens-panel-resize {
  display: none;
}

/* Panel Header (Draggable) */
.three-lens-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(180deg, var(--3lens-bg-secondary), var(--3lens-bg-primary));
  border-bottom: 1px solid var(--3lens-border);
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}

.three-lens-panel-header:active {
  cursor: grabbing;
}

.three-lens-panel-icon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.three-lens-panel-title {
  flex: 1;
  font-weight: 600;
  font-size: 12px;
  color: var(--3lens-text-primary);
}

.three-lens-panel-controls {
  display: flex;
  gap: 4px;
}

.three-lens-panel-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--3lens-radius-sm);
  background: transparent;
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 100ms ease;
}

.three-lens-panel-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-panel-btn.close:hover {
  background: var(--3lens-error);
  color: white;
}

/* Panel Content */
.three-lens-panel-content {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.three-lens-panel-content::-webkit-scrollbar {
  width: 6px;
}

.three-lens-panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-panel-content::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* Panel Resize Handle */
.three-lens-panel-resize {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  opacity: 0.5;
  transition: opacity 100ms ease;
}

.three-lens-panel-resize:hover {
  opacity: 1;
}

.three-lens-panel-resize::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--3lens-text-tertiary);
  border-bottom: 2px solid var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   STATS PANEL CONTENT
   ═══════════════════════════════════════════════════════════════ */

.three-lens-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.three-lens-stat-card {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
}

.three-lens-stat-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 4px;
}

.three-lens-stat-value {
  font-size: 22px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1;
}

.three-lens-stat-value.warning { color: var(--3lens-warning); }
.three-lens-stat-value.error { color: var(--3lens-error); }

.three-lens-stat-unit {
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

/* Chart */
.three-lens-chart {
  margin-top: 12px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
}

.three-lens-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.three-lens-chart-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
}

.three-lens-chart-value {
  font-family: var(--3lens-font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--3lens-accent-emerald);
}

.three-lens-chart-canvas {
  width: 100%;
  height: 50px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-sm);
}

/* ═══════════════════════════════════════════════════════════════
   SCENE TREE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-tree {
  font-size: 12px;
}

.three-lens-node {
  user-select: none;
}

.three-lens-node-header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: var(--3lens-radius-sm);
  cursor: pointer;
  transition: background 100ms ease;
}

.three-lens-node-header:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-node-header.selected {
  background: rgba(96, 165, 250, 0.15);
  outline: 1px solid var(--3lens-accent-blue);
}

.three-lens-node-toggle {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
}

.three-lens-node-toggle.expanded svg {
  transform: rotate(90deg);
}

.three-lens-node-toggle.hidden {
  visibility: hidden;
}

.three-lens-node-icon {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  flex-shrink: 0;
}

.three-lens-node-icon.mesh { background: var(--3lens-color-mesh); color: #000; }
.three-lens-node-icon.scene { background: var(--3lens-color-scene); color: #000; }
.three-lens-node-icon.group { background: var(--3lens-color-group); color: #000; }
.three-lens-node-icon.light { background: var(--3lens-color-light); color: #000; }
.three-lens-node-icon.camera { background: var(--3lens-color-camera); color: #000; }
.three-lens-node-icon.object { background: var(--3lens-text-tertiary); color: #000; }

.three-lens-node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-node-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
}

.three-lens-node-children {
  margin-left: 14px;
  border-left: 1px solid var(--3lens-border-subtle);
  padding-left: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   INSPECTOR PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-inspector-empty {
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
  font-size: 12px;
}

.three-lens-section {
  margin-bottom: 12px;
}

.three-lens-section-header {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--3lens-border-subtle);
  margin-bottom: 8px;
}

.three-lens-property-row {
  display: flex;
  align-items: center;
  padding: 3px 0;
  font-size: 11px;
}

.three-lens-property-name {
  width: 80px;
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
}

.three-lens-property-value {
  flex: 1;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 11px;
}

.three-lens-vector-inputs {
  display: flex;
  gap: 4px;
  flex: 1;
}

.three-lens-vector-input {
  flex: 1;
  min-width: 0;
}

.three-lens-vector-input input {
  width: 100%;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 4px 6px;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  text-align: center;
  outline: none;
}

.three-lens-vector-input input:focus {
  border-color: var(--3lens-border-focus);
}

.three-lens-vector-label {
  font-size: 8px;
  color: var(--3lens-text-disabled);
  text-align: center;
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.three-lens-panel {
  animation: fadeIn 150ms ease;
}
`;
