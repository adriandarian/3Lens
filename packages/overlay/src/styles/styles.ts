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
  background: var(--3lens-bg-primary);
  border: 2px solid var(--3lens-border);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--3lens-text-primary);
  box-shadow: var(--3lens-shadow-md), 0 0 20px rgba(34, 211, 238, 0.3);
  z-index: 999998;
  transition: all 150ms ease;
  user-select: none;
}

.three-lens-fab svg {
  width: 28px;
  height: 28px;
}

.three-lens-fab:hover {
  transform: scale(1.1);
  border-color: var(--3lens-accent-cyan);
  box-shadow: var(--3lens-shadow-lg), 0 0 30px rgba(34, 211, 238, 0.4);
}

.three-lens-fab:active {
  transform: scale(0.95);
}

.three-lens-fab.active {
  background: var(--3lens-bg-elevated);
  border-color: var(--3lens-accent-cyan);
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
  min-height: 100px;
  display: flex;
  flex-direction: column;
  font-family: var(--3lens-font-sans);
  font-size: 13px;
  color: var(--3lens-text-primary);
  overflow: hidden;
  transition: box-shadow 150ms ease;
}

/* Disable transitions during resize */
.three-lens-panel.resizing {
  transition: none !important;
}

/* Smooth width animation only when not resizing */
.three-lens-panel:not(.resizing) {
  transition: box-shadow 150ms ease, width 150ms ease, min-width 150ms ease;
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
  font-weight: 600;
  font-size: 12px;
  color: var(--3lens-text-primary);
  white-space: nowrap;
}

/* When no search bar, title pushes controls right */
.three-lens-panel-header:not(:has(.three-lens-header-search)) .three-lens-panel-title {
  flex: 1;
}

.three-lens-header-search {
  flex: 1;
  margin: 0 12px;
  min-width: 120px;
}

.header-search-input {
  width: 100%;
  padding: 5px 10px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.header-search-input:focus {
  border-color: var(--3lens-accent-blue);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15);
}

.header-search-input::placeholder {
  color: var(--3lens-text-tertiary);
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
  min-height: 0;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
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
  gap: 4px;
}

.three-lens-stat-card {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
}

.three-lens-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 2px;
}

.three-lens-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1;
}

.three-lens-stat-value.warning { color: var(--3lens-warning); }
.three-lens-stat-value.error { color: var(--3lens-error); }

.three-lens-stat-unit {
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

/* Chart */
.three-lens-chart {
  margin-top: 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 6px;
}

.three-lens-chart-title {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
}

.three-lens-chart-controls {
  display: flex;
  align-items: center;
  gap: 3px;
  flex: 1;
  justify-content: center;
}

.three-lens-chart-btn {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  font-size: 10px;
  transition: all 100ms ease;
}

.three-lens-chart-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
  border-color: var(--3lens-accent-blue);
}

.three-lens-chart-btn:active {
  transform: scale(0.95);
}

.three-lens-chart-zoom-label {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 24px;
  text-align: center;
}

.three-lens-chart-value {
  font-family: var(--3lens-font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--3lens-accent-emerald);
}

.three-lens-chart-container {
  position: relative;
  cursor: grab;
}

.three-lens-chart-container:active {
  cursor: grabbing;
}

.three-lens-chart-canvas {
  width: 100%;
  height: 60px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-chart-tooltip {
  position: absolute;
  background: var(--3lens-bg-elevated);
  border: 1px solid var(--3lens-border-focus);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 10px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  pointer-events: none;
  z-index: 10;
  box-shadow: var(--3lens-shadow-md);
}

.three-lens-tooltip-time {
  color: var(--3lens-accent-cyan);
  font-weight: 600;
}

.three-lens-tooltip-fps {
  color: var(--3lens-text-secondary);
  font-size: 9px;
  margin-top: 2px;
}

.three-lens-chart-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-chart-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.three-lens-chart-stat-label {
  font-size: 7px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-disabled);
}

.three-lens-chart-stat-value {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-chart-stat-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   SCENE SPLIT VIEW (Tree + Inspector integrated)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-split-view {
  display: flex;
  gap: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.three-lens-tree-pane {
  flex: 1;
  min-width: 180px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--3lens-border);
  padding: 8px;
}

.three-lens-tree-pane::-webkit-scrollbar {
  width: 6px;
}

.three-lens-tree-pane::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-tree-pane::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

.three-lens-inspector-pane {
  width: 240px;
  min-width: 200px;
  max-width: 300px;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--3lens-bg-secondary);
  padding: 12px;
}

.three-lens-inspector-pane::-webkit-scrollbar {
  width: 6px;
}

.three-lens-inspector-pane::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-inspector-pane::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* No Selection State */
.three-lens-no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
}

.three-lens-no-selection-icon {
  font-size: 28px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.three-lens-no-selection-text {
  font-size: 11px;
  line-height: 1.4;
}

/* Remove padding from panel content for split view and full tree */
.three-lens-panel-content:has(.three-lens-split-view),
.three-lens-panel-content:has(.three-lens-tree-full),
.three-lens-panel-content:has(.panel-split-view),
.three-lens-panel-content:has(.panel-empty-state) {
  padding: 0;
}

/* Auto-height scene panel */
.three-lens-panel:has(.three-lens-tree-full),
.three-lens-panel:has(.three-lens-split-view) {
  height: auto;
  max-height: 80vh;
}

/* Ensure panel content constrains height for scrolling */
.three-lens-panel:has(.three-lens-split-view) .three-lens-panel-content {
  max-height: calc(80vh - 50px);
  overflow: hidden;
}

/* Full width tree (no selection) */
.three-lens-tree-full {
  overflow: auto;
  padding: 8px;
  height: 100%;
}

.three-lens-tree-full::-webkit-scrollbar {
  width: 6px;
}

.three-lens-tree-full::-webkit-scrollbar-track {
  background: transparent;
}

.three-lens-tree-full::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 3px;
}

/* ═══════════════════════════════════════════════════════════════
   SCENE TREE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-scene-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 11px;
  color: var(--3lens-text-secondary);
  user-select: none;
}

.three-lens-toggle input {
  display: none;
}

.three-lens-toggle-slider {
  position: relative;
  width: 32px;
  height: 18px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 9px;
  transition: all 150ms ease;
}

.three-lens-toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 150ms ease;
}

.three-lens-toggle input:checked + .three-lens-toggle-slider {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle input:checked + .three-lens-toggle-slider::after {
  left: 16px;
  background: var(--3lens-bg-primary);
}

.three-lens-toggle-label {
  font-weight: 500;
}

.three-lens-toggle:hover .three-lens-toggle-slider {
  border-color: var(--3lens-accent-blue);
}

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
  background: rgba(96, 165, 250, 0.25);
  outline: 1px solid var(--3lens-accent-blue);
  box-shadow: inset 3px 0 0 var(--3lens-accent-cyan);
}

.three-lens-node-header.selected .three-lens-node-name {
  color: var(--3lens-accent-cyan);
  font-weight: 600;
}

.three-lens-node-header.selected .three-lens-node-type {
  color: var(--3lens-accent-blue);
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 20px;
}

.three-lens-node-name.unnamed {
  font-style: italic;
  color: var(--3lens-text-tertiary);
}

.three-lens-visibility-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 4px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: var(--3lens-text-tertiary);
  cursor: pointer;
  opacity: 0;
  transition: all 100ms ease;
  flex-shrink: 0;
}

.three-lens-node-spacer {
  flex: 1;
  min-width: 8px;
}

.three-lens-node-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  flex-shrink: 0;
}

.three-lens-node-header:hover .three-lens-visibility-btn {
  opacity: 1;
}

.three-lens-visibility-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-visibility-btn.visible {
  color: var(--3lens-accent-cyan);
}

.three-lens-visibility-btn.hidden {
  color: var(--3lens-text-disabled);
  opacity: 1;
}

.three-lens-node-header.hidden-object {
  opacity: 0.5;
}

.three-lens-node-header.hidden-object .three-lens-node-name {
  text-decoration: line-through;
  color: var(--3lens-text-disabled);
}

.three-lens-node-children {
  margin-left: 14px;
  border-left: 1px solid var(--3lens-border-subtle);
  padding-left: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   COST HEATMAP COLORS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-node-header.cost-low {
  border-left: 2px solid var(--3lens-accent-green);
}

.three-lens-node-header.cost-medium {
  border-left: 2px solid var(--3lens-accent-yellow);
}

.three-lens-node-header.cost-high {
  border-left: 2px solid var(--3lens-accent-orange);
}

.three-lens-node-header.cost-critical {
  border-left: 2px solid var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.1);
}

.three-lens-cost-indicator {
  font-size: 8px;
  margin-left: 2px;
  flex-shrink: 0;
}

.three-lens-cost-indicator.cost-low { color: var(--3lens-accent-green); }
.three-lens-cost-indicator.cost-medium { color: var(--3lens-accent-yellow); }
.three-lens-cost-indicator.cost-high { color: var(--3lens-accent-orange); }
.three-lens-cost-indicator.cost-critical { color: var(--3lens-accent-red); }

/* ═══════════════════════════════════════════════════════════════
   COST ANALYSIS SECTION
   ═══════════════════════════════════════════════════════════════ */

.three-lens-cost-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  margin-bottom: 6px;
}

.three-lens-cost-level {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
}

.three-lens-cost-level.cost-low {
  background: rgba(34, 197, 94, 0.2);
  color: var(--3lens-accent-green);
}

.three-lens-cost-level.cost-medium {
  background: rgba(234, 179, 8, 0.2);
  color: var(--3lens-accent-yellow);
}

.three-lens-cost-level.cost-high {
  background: rgba(249, 115, 22, 0.2);
  color: var(--3lens-accent-orange);
}

.three-lens-cost-level.cost-critical {
  background: rgba(239, 68, 68, 0.2);
  color: var(--3lens-accent-red);
}

.three-lens-cost-score {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
}

.three-lens-cost-breakdown {
  margin-bottom: 8px;
}

.three-lens-cost-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--3lens-bg-tertiary);
  margin-bottom: 4px;
}

.three-lens-cost-bar-segment {
  height: 100%;
  min-width: 1px;
  transition: width 200ms ease;
}

.three-lens-cost-bar-segment.triangles { background: #60a5fa; }
.three-lens-cost-bar-segment.material { background: #a78bfa; }
.three-lens-cost-bar-segment.textures { background: #34d399; }
.three-lens-cost-bar-segment.shadows { background: #fbbf24; }

.three-lens-cost-legend {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.three-lens-cost-legend-item {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-cost-legend-item.triangles { color: #60a5fa; }
.three-lens-cost-legend-item.material { color: #a78bfa; }
.three-lens-cost-legend-item.textures { color: #34d399; }
.three-lens-cost-legend-item.shadows { color: #fbbf24; }

.three-lens-cost-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.three-lens-cost-row {
  display: flex;
  align-items: center;
  font-size: 10px;
  padding: 2px 0;
}

.three-lens-cost-row-label {
  width: 60px;
  color: var(--3lens-text-secondary);
}

.three-lens-cost-row-value {
  width: 40px;
  color: var(--3lens-text-primary);
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-row-detail {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

/* Material Details */
.three-lens-material-details {
  border-top: 1px solid var(--3lens-border-subtle);
  padding-top: 6px;
  margin-top: 4px;
}

.three-lens-material-details-header {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.three-lens-material-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
  font-size: 10px;
}

.three-lens-material-type {
  color: var(--3lens-text-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-material-score {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-material-features {
  display: flex;
  gap: 3px;
}

.three-lens-mat-feature {
  font-size: 8px;
  padding: 1px 3px;
  background: var(--3lens-bg-tertiary);
  border-radius: 2px;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   COST RANKING (Global Tools)
   ═══════════════════════════════════════════════════════════════ */

.three-lens-cost-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.three-lens-cost-summary-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
}

.three-lens-cost-summary-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-summary-label {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.three-lens-cost-warning {
  display: flex;
  gap: 8px;
  padding: 4px 6px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 10px;
}

.three-lens-cost-warning .cost-critical {
  color: var(--3lens-accent-red);
}

.three-lens-cost-warning .cost-high {
  color: var(--3lens-accent-orange);
}

.three-lens-cost-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.three-lens-cost-ranking-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  cursor: pointer;
  transition: background 100ms ease;
}

.three-lens-cost-ranking-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-cost-rank {
  font-size: 9px;
  font-weight: 600;
  color: var(--3lens-text-tertiary);
  width: 18px;
}

.three-lens-cost-ranking-name {
  flex: 1;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-cost-ranking-triangles {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-cost-ranking-score {
  font-size: 10px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  padding: 1px 4px;
  border-radius: 3px;
}

.three-lens-cost-ranking-score.cost-low {
  color: var(--3lens-accent-green);
  background: rgba(34, 197, 94, 0.15);
}

.three-lens-cost-ranking-score.cost-medium {
  color: var(--3lens-accent-yellow);
  background: rgba(234, 179, 8, 0.15);
}

.three-lens-cost-ranking-score.cost-high {
  color: var(--3lens-accent-orange);
  background: rgba(249, 115, 22, 0.15);
}

.three-lens-cost-ranking-score.cost-critical {
  color: var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.15);
}

.three-lens-cost-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
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
  display: block;
  margin-bottom: 12px;
}

.three-lens-section-header {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--3lens-border-subtle);
  margin-bottom: 8px;
}

/* Visual Overlays Toggle Styles */
.three-lens-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 11px;
}

.three-lens-toggle-row.global {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-toggle-label {
  color: var(--3lens-text-secondary);
}

.three-lens-toggle-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}

.three-lens-toggle-track {
  display: flex;
  align-items: center;
  width: 32px;
  height: 18px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 9px;
  padding: 2px;
  transition: all 0.2s ease;
}

.three-lens-toggle-thumb {
  width: 12px;
  height: 12px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.three-lens-toggle-btn:hover .three-lens-toggle-track {
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle-btn.active .three-lens-toggle-track {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-toggle-btn.active .three-lens-toggle-thumb {
  background: var(--3lens-bg-primary);
  transform: translateX(14px);
}

.three-lens-overlay-note {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
  padding: 4px 0;
}

/* Global Tools Panel */
.three-lens-global-tools {
  padding: 0;
}

.three-lens-global-tools-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  background: linear-gradient(135deg, var(--3lens-accent-cyan-dim) 0%, var(--3lens-bg-hover) 100%);
  border-bottom: 1px solid var(--3lens-border);
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-accent-cyan);
}

.three-lens-global-icon {
  font-size: 14px;
}

/* Sections inside global tools - cleaner look */
.three-lens-global-tools .three-lens-section {
  padding: 10px;
  margin-bottom: 0;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-global-tools .three-lens-section:last-child {
  border-bottom: none;
}

.three-lens-global-tools .three-lens-section-header {
  border-bottom: none;
  padding-bottom: 8px;
  margin-bottom: 0;
}

.three-lens-global-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  line-height: 1.4;
  padding: 4px 0;
}

.three-lens-camera-info {
  margin-bottom: 10px;
}

.three-lens-property-row.compact {
  padding: 3px 0;
}

.three-lens-property-row.compact .three-lens-property-name {
  width: 55px;
  min-width: 55px;
}

.three-lens-property-row.compact .three-lens-property-value {
  font-size: 10px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.three-lens-camera-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Transform Gizmo Styles */
.three-lens-transform-modes {
  margin: 8px 0;
}

.three-lens-transform-modes.disabled,
.three-lens-transform-options.disabled,
.three-lens-undo-redo.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.three-lens-mode-label {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 6px;
}

.three-lens-mode-buttons {
  display: flex;
  gap: 4px;
}

.three-lens-mode-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 28px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.three-lens-mode-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-mode-btn.active {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
}

.three-lens-transform-options {
  margin: 8px 0;
}

.three-lens-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 11px;
}

.three-lens-option-label {
  color: var(--3lens-text-secondary);
}

.three-lens-space-btn {
  padding: 4px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-primary);
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 50px;
  text-align: center;
}

.three-lens-space-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
}

.three-lens-undo-redo {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-undo-btn,
.three-lens-redo-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  justify-content: center;
}

.three-lens-undo-btn:hover:not(.disabled),
.three-lens-redo-btn:hover:not(.disabled) {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-undo-btn.disabled,
.three-lens-redo-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Camera Controls Styles */
.three-lens-camera-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.three-lens-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  justify-content: center;
}

.three-lens-action-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.three-lens-action-btn.stop {
  background: var(--3lens-error);
  border-color: var(--3lens-error);
  color: white;
}

.three-lens-action-btn.stop:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.three-lens-action-btn.home {
  background: var(--3lens-accent-emerald);
  border-color: var(--3lens-accent-emerald);
  color: var(--3lens-bg-primary);
}

.three-lens-action-btn.home:hover {
  background: #2dd4bf;
  border-color: #2dd4bf;
}

.three-lens-camera-info {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  margin-bottom: 12px;
}

.three-lens-camera-info-title {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.three-lens-camera-info-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-camera-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.three-lens-camera-info-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-camera-info-value {
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
}

.three-lens-camera-switcher {
  margin-top: 8px;
}

.three-lens-camera-switcher-title {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.three-lens-camera-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-camera-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.three-lens-camera-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
}

.three-lens-camera-item.active {
  background: var(--3lens-accent-cyan);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
}

.three-lens-camera-item-icon {
  font-size: 12px;
}

.three-lens-camera-item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-property-row {
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 11px;
}

.three-lens-property-name {
  width: 95px;
  min-width: 95px;
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
   BENCHMARK SCORE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-benchmark {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-benchmark-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.three-lens-benchmark-score {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.three-lens-benchmark-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-benchmark-value.grade-A { color: var(--3lens-success); }
.three-lens-benchmark-value.grade-B { color: var(--3lens-accent-emerald); }
.three-lens-benchmark-value.grade-C { color: var(--3lens-warning); }
.three-lens-benchmark-value.grade-D { color: var(--3lens-accent-amber); }
.three-lens-benchmark-value.grade-F { color: var(--3lens-error); }

.three-lens-benchmark-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
}

.three-lens-benchmark-grade {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-benchmark-grade.A { background: var(--3lens-success); color: #000; }
.three-lens-benchmark-grade.B { background: var(--3lens-accent-emerald); color: #000; }
.three-lens-benchmark-grade.C { background: var(--3lens-warning); color: #000; }
.three-lens-benchmark-grade.D { background: var(--3lens-accent-amber); color: #000; }
.three-lens-benchmark-grade.F { background: var(--3lens-error); color: #fff; }

.three-lens-benchmark-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-benchmark-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-benchmark-bar-label {
  width: 80px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.three-lens-benchmark-bar-track {
  flex: 1;
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.three-lens-benchmark-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 300ms ease;
}

.three-lens-benchmark-bar-fill.good { background: var(--3lens-success); }
.three-lens-benchmark-bar-fill.ok { background: var(--3lens-warning); }
.three-lens-benchmark-bar-fill.bad { background: var(--3lens-error); }

.three-lens-benchmark-bar-value {
  width: 30px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  text-align: right;
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-tabs {
  display: flex;
  gap: 1px;
  margin-bottom: 8px;
  background: var(--3lens-bg-secondary);
  padding: 2px;
  border-radius: var(--3lens-radius-sm);
}

.three-lens-tab {
  flex: 1;
  padding: 4px 6px;
  background: transparent;
  border: none;
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-tertiary);
  font-size: 9px;
  font-family: var(--3lens-font-sans);
  cursor: pointer;
  transition: all 100ms ease;
}

.three-lens-tab:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.three-lens-tab.active {
  background: var(--3lens-accent-cyan);
  color: var(--3lens-bg-primary);
  font-weight: 600;
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY STATS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.three-lens-memory-item {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-memory-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 4px;
}

.three-lens-memory-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
}

/* ═══════════════════════════════════════════════════════════════
   DETAILED METRICS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-metrics-section {
  margin-bottom: 16px;
}

.three-lens-metrics-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.three-lens-metrics-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--3lens-border-subtle);
}

.three-lens-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.three-lens-metric {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  text-align: center;
}

.three-lens-metric-value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1.2;
}

.three-lens-metric-label {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

/* ═══════════════════════════════════════════════════════════════
   ISSUES LIST
   ═══════════════════════════════════════════════════════════════ */

.three-lens-issues {
  margin-top: 12px;
}

.three-lens-issue {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 6px;
  font-size: 11px;
}

.three-lens-issue.warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}

.three-lens-issue-icon {
  flex-shrink: 0;
  font-size: 12px;
}

.three-lens-issue-text {
  flex: 1;
  color: var(--3lens-text-secondary);
  line-height: 1.4;
}

.three-lens-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 6px;
  font-size: 11px;
}

.three-lens-suggestion-text {
  flex: 1;
  color: var(--3lens-accent-emerald);
  line-height: 1.4;
}

/* ═══════════════════════════════════════════════════════════════
   PERCENTILE STATS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-percentiles {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-percentile {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
}

.three-lens-percentile-label {
  color: var(--3lens-text-disabled);
}

.three-lens-percentile-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.three-lens-panel {
  animation: fadeIn 150ms ease;
}

.three-lens-stat-value.warning {
  animation: pulse 1s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY PROFILER
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-profiler {
  padding: 12px;
}

/* Memory Header */
.three-lens-memory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.three-lens-memory-total {
  text-align: left;
}

.three-lens-memory-total-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  line-height: 1;
}

.three-lens-memory-total-value.warning {
  color: var(--3lens-warning);
}

.three-lens-memory-total-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

.three-lens-memory-trend {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-trend.stable {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-tertiary);
}

.three-lens-memory-trend.rising {
  color: var(--3lens-warning);
  background: rgba(245, 158, 11, 0.15);
}

.three-lens-memory-trend.falling {
  color: var(--3lens-accent-emerald);
  background: rgba(52, 211, 153, 0.15);
}

/* Memory Breakdown */
.three-lens-memory-breakdown {
  margin-bottom: 16px;
}

.three-lens-memory-breakdown-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.three-lens-memory-bar {
  height: 12px;
  background: var(--3lens-bg-tertiary);
  border-radius: 6px;
  display: flex;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-memory-bar-segment {
  height: 100%;
  min-width: 2px;
  transition: width 300ms ease;
}

.three-lens-memory-bar-segment.texture {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

.three-lens-memory-bar-segment.geometry {
  background: linear-gradient(90deg, #34d399, #10b981);
}

.three-lens-memory-bar-segment.render-target {
  background: linear-gradient(90deg, #a78bfa, #8b5cf6);
}

/* Memory Legend */
.three-lens-memory-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-memory-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.three-lens-memory-legend-color {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.three-lens-memory-legend-color.texture {
  background: #60a5fa;
}

.three-lens-memory-legend-color.geometry {
  background: #34d399;
}

.three-lens-memory-legend-color.render-target {
  background: #a78bfa;
}

.three-lens-memory-legend-label {
  flex: 1;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-legend-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  font-weight: 500;
}

.three-lens-memory-legend-value.warning {
  color: var(--3lens-warning);
}

/* Memory History Chart */
.three-lens-memory-chart {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
  margin-bottom: 16px;
}

.three-lens-memory-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.three-lens-memory-chart-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-chart-max {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-memory-chart-empty {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--3lens-text-disabled);
}

.three-lens-memory-chart-svg {
  width: 100%;
  height: 48px;
}

.three-lens-memory-chart-area {
  opacity: 0.8;
}

.three-lens-memory-chart-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.three-lens-memory-chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 9px;
  color: var(--3lens-text-disabled);
}

/* JS Heap Bar */
.three-lens-heap-container {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-heap-bar {
  height: 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-heap-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--3lens-accent-cyan), var(--3lens-accent-blue));
  border-radius: 4px;
  transition: width 300ms ease;
}

.three-lens-heap-bar-fill.warning {
  background: linear-gradient(90deg, var(--3lens-warning), var(--3lens-error));
}

.three-lens-heap-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.three-lens-heap-used {
  font-family: var(--3lens-font-mono);
  font-weight: 600;
  color: var(--3lens-accent-cyan);
}

.three-lens-heap-used.warning {
  color: var(--3lens-warning);
}

.three-lens-heap-separator {
  color: var(--3lens-text-disabled);
}

.three-lens-heap-limit {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-heap-percent {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  margin-left: 4px;
}

.three-lens-heap-percent.warning {
  color: var(--3lens-warning);
}

/* Memory Warnings */
.three-lens-memory-warnings {
  margin-top: 12px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
}

.three-lens-memory-warnings-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-warning);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-memory-warning {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  padding: 4px 0;
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
}

.three-lens-memory-warning:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FPS HISTOGRAM
   ═══════════════════════════════════════════════════════════════ */

.three-lens-histogram {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-histogram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-histogram-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-histogram-total {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-histogram-empty {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--3lens-text-disabled);
}

.three-lens-histogram-chart {
  display: flex;
  align-items: flex-end;
  height: 60px;
  gap: 2px;
}

.three-lens-histogram-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  cursor: pointer;
}

.three-lens-histogram-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 300ms ease;
}

.three-lens-histogram-bar.good {
  background: linear-gradient(180deg, var(--3lens-accent-emerald), #059669);
}

.three-lens-histogram-bar.ok {
  background: linear-gradient(180deg, var(--3lens-accent-amber), #d97706);
}

.three-lens-histogram-bar.bad {
  background: linear-gradient(180deg, var(--3lens-error), #b91c1c);
}

.three-lens-histogram-label {
  font-size: 7px;
  color: var(--3lens-text-disabled);
  margin-top: 4px;
}

.three-lens-histogram-legend {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-histogram-legend-item {
  font-size: 9px;
}

.three-lens-histogram-legend-item.good { color: var(--3lens-accent-emerald); }
.three-lens-histogram-legend-item.ok { color: var(--3lens-accent-amber); }
.three-lens-histogram-legend-item.bad { color: var(--3lens-error); }

/* ═══════════════════════════════════════════════════════════════
   FRAME TIME PERCENTILES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-percentiles-section {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-percentiles-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-percentiles-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-percentile-item {
  text-align: center;
  padding: 8px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-percentile-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-bottom: 2px;
}

.three-lens-percentile-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-percentile-value.warning {
  color: var(--3lens-warning);
}

.three-lens-percentile-value.error {
  color: var(--3lens-error);
}

.three-lens-percentiles-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-percentile-summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-percentile-summary-label {
  color: var(--3lens-text-disabled);
}

.three-lens-percentile-summary-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 500;
}

.three-lens-percentile-summary-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   BOTTLENECK ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-bottleneck-section {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-bottleneck-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-bottleneck-ok {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-sm);
  font-size: 11px;
  color: var(--3lens-accent-emerald);
}

.three-lens-bottleneck-ok-icon {
  font-size: 14px;
}

.three-lens-bottleneck-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.three-lens-bottleneck-item {
  padding: 10px;
  border-radius: var(--3lens-radius-sm);
  border-left: 3px solid transparent;
}

.three-lens-bottleneck-item.low {
  background: rgba(59, 130, 246, 0.1);
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-bottleneck-item.medium {
  background: rgba(245, 158, 11, 0.1);
  border-left-color: var(--3lens-warning);
}

.three-lens-bottleneck-item.high {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: var(--3lens-error);
}

.three-lens-bottleneck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.three-lens-bottleneck-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.three-lens-bottleneck-severity {
  font-size: 8px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-bottleneck-severity.low { background: var(--3lens-accent-blue); color: white; }
.three-lens-bottleneck-severity.medium { background: var(--3lens-warning); color: white; }
.three-lens-bottleneck-severity.high { background: var(--3lens-error); color: white; }

.three-lens-bottleneck-message {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
}

.three-lens-bottleneck-suggestion {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   RENDER PIPELINE VISUALIZATION
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rendering-profiler {
  padding: 12px;
}

.three-lens-pipeline {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-pipeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-pipeline-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-pipeline-time {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-pipeline-bar {
  height: 20px;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.three-lens-pipeline-segment {
  height: 100%;
  min-width: 4px;
  transition: width 300ms ease;
}

.three-lens-pipeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.three-lens-pipeline-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-pipeline-legend-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.three-lens-pipeline-legend-label {
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   DRAW CALL EFFICIENCY
   ═══════════════════════════════════════════════════════════════ */

.three-lens-efficiency {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-efficiency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-efficiency-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-efficiency-grade {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-efficiency-content {
  display: flex;
  gap: 12px;
  align-items: center;
}

.three-lens-efficiency-meter {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-efficiency-bar {
  flex: 1;
  height: 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.three-lens-efficiency-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 300ms ease;
}

.three-lens-efficiency-value {
  font-size: 12px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 36px;
  text-align: right;
}

.three-lens-efficiency-stats {
  display: flex;
  gap: 12px;
}

.three-lens-efficiency-stat {
  text-align: center;
}

.three-lens-efficiency-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  display: block;
}

.three-lens-efficiency-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

.three-lens-efficiency-history {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-efficiency-history-title {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-bottom: 6px;
}

.three-lens-mini-chart {
  width: 100%;
  height: 32px;
}

/* ═══════════════════════════════════════════════════════════════
   OBJECT VISIBILITY BREAKDOWN
   ═══════════════════════════════════════════════════════════════ */

.three-lens-visibility-breakdown {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-visibility-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-visibility-bar {
  height: 12px;
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.three-lens-visibility-segment {
  height: 100%;
  min-width: 2px;
  transition: width 300ms ease;
}

.three-lens-visibility-segment.visible {
  background: linear-gradient(90deg, var(--3lens-accent-emerald), #059669);
}

.three-lens-visibility-segment.culled {
  background: linear-gradient(90deg, var(--3lens-text-disabled), #4b5563);
}

.three-lens-visibility-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-visibility-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.three-lens-visibility-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.three-lens-visibility-dot.visible { background: var(--3lens-accent-emerald); }
.three-lens-visibility-dot.culled { background: var(--3lens-text-disabled); }
.three-lens-visibility-dot.transparent { background: var(--3lens-accent-cyan); }
.three-lens-visibility-dot.opaque { background: var(--3lens-accent-blue); }

.three-lens-visibility-label {
  color: var(--3lens-text-tertiary);
  flex: 1;
}

.three-lens-visibility-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   LIGHTING ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-lighting {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-lighting-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-lighting-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.three-lens-lighting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-lighting-item.warning {
  background: rgba(245, 158, 11, 0.15);
}

.three-lens-lighting-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.three-lens-lighting-info {
  text-align: center;
}

.three-lens-lighting-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-amber);
}

.three-lens-lighting-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

.three-lens-lighting-warning {
  margin-top: 10px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-sm);
  font-size: 10px;
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION & INSTANCING
   ═══════════════════════════════════════════════════════════════ */

.three-lens-animation {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-animation-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-animation-empty {
  font-size: 11px;
  color: var(--3lens-text-disabled);
  text-align: center;
  padding: 10px;
}

.three-lens-animation-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.three-lens-animation-section {
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  padding: 10px;
}

.three-lens-animation-section-title {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.three-lens-animation-stats {
  display: flex;
  gap: 12px;
}

.three-lens-animation-stat {
  text-align: center;
  flex: 1;
}

.three-lens-animation-stat-value {
  font-size: 16px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
  display: block;
}

.three-lens-animation-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
}

/* ═══════════════════════════════════════════════════════════════
   STATE CHANGES ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-state-changes {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-state-changes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-state-changes-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-state-changes-total {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-state-changes-total.warning {
  color: var(--3lens-warning);
}

.three-lens-state-changes-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.three-lens-state-change-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-state-change-bar {
  flex: 1;
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.three-lens-state-change-fill {
  height: 100%;
  border-radius: 3px;
}

.three-lens-state-change-fill.program { background: var(--3lens-accent-violet); }
.three-lens-state-change-fill.texture { background: var(--3lens-accent-blue); }
.three-lens-state-change-fill.rt { background: var(--3lens-accent-cyan); }
.three-lens-state-change-fill.upload { background: var(--3lens-accent-emerald); }

.three-lens-state-change-info {
  display: flex;
  justify-content: space-between;
  min-width: 100px;
}

.three-lens-state-change-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.three-lens-state-change-value {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-state-changes-upload {
  margin-top: 8px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  text-align: right;
}

/* ═══════════════════════════════════════════════════════════════
   XR MODE INFO
   ═══════════════════════════════════════════════════════════════ */

.three-lens-xr {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-xr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-xr-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-accent-violet);
}

.three-lens-xr-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--3lens-accent-violet);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-xr-stats {
  display: flex;
  gap: 20px;
}

.three-lens-xr-stat {
  text-align: center;
}

.three-lens-xr-stat-value {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-violet);
  display: block;
}

.three-lens-xr-stat-label {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--3lens-text-tertiary);
}

/* ═══════════════════════════════════════════════════════════════
   RENDERING WARNINGS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rendering-warnings {
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 10px;
}

.three-lens-rendering-warnings-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-warning);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-rendering-warning {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  padding: 4px 0;
  border-bottom: 1px solid rgba(245, 158, 11, 0.1);
}

.three-lens-rendering-warning:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* ═══════════════════════════════════════════════════════════════
   FRAME BUDGET GAUGE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-budget-gauge {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-budget-gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.three-lens-budget-gauge-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-budget-gauge-target {
  font-size: 9px;
  color: var(--3lens-text-disabled);
}

.three-lens-budget-gauge-visual {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.three-lens-gauge-svg {
  width: 160px;
  height: 90px;
}

.three-lens-budget-gauge-value {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.three-lens-budget-gauge-number {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-budget-gauge-unit {
  font-size: 12px;
  color: var(--3lens-text-secondary);
}

.three-lens-budget-gauge-value.excellent .three-lens-budget-gauge-number { color: var(--3lens-accent-emerald); }
.three-lens-budget-gauge-value.good .three-lens-budget-gauge-number { color: var(--3lens-accent-cyan); }
.three-lens-budget-gauge-value.warning .three-lens-budget-gauge-number { color: var(--3lens-warning); }
.three-lens-budget-gauge-value.over .three-lens-budget-gauge-number { color: var(--3lens-accent-amber); }
.three-lens-budget-gauge-value.critical .three-lens-budget-gauge-number { color: var(--3lens-error); }

.three-lens-budget-gauge-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-budget-gauge-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.three-lens-budget-gauge-status.excellent { background: rgba(52, 211, 153, 0.2); color: var(--3lens-accent-emerald); }
.three-lens-budget-gauge-status.good { background: rgba(34, 211, 238, 0.2); color: var(--3lens-accent-cyan); }
.three-lens-budget-gauge-status.warning { background: rgba(245, 158, 11, 0.2); color: var(--3lens-warning); }
.three-lens-budget-gauge-status.over { background: rgba(251, 191, 36, 0.2); color: var(--3lens-accent-amber); }
.three-lens-budget-gauge-status.critical { background: rgba(239, 68, 68, 0.2); color: var(--3lens-error); }

.three-lens-budget-gauge-remaining {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.three-lens-budget-gauge-remaining .over { color: var(--3lens-error); }
.three-lens-budget-gauge-remaining .under { color: var(--3lens-accent-emerald); }

.three-lens-budget-gauge-breakdown {
  margin-top: 8px;
}

.three-lens-budget-bar {
  height: 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  display: flex;
  overflow: visible;
  position: relative;
}

.three-lens-budget-bar-fill {
  height: 100%;
  border-radius: 4px 0 0 4px;
  transition: width 300ms ease;
}

.three-lens-budget-bar-fill.excellent { background: var(--3lens-accent-emerald); }
.three-lens-budget-bar-fill.good { background: var(--3lens-accent-cyan); }
.three-lens-budget-bar-fill.warning { background: var(--3lens-warning); }
.three-lens-budget-bar-fill.over { background: var(--3lens-accent-amber); }
.three-lens-budget-bar-fill.critical { background: var(--3lens-error); }

.three-lens-budget-bar-over {
  height: 100%;
  background: var(--3lens-error);
  border-radius: 0 4px 4px 0;
  animation: pulse 1s ease-in-out infinite;
}

.three-lens-budget-labels {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: var(--3lens-text-disabled);
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   SESSION STATISTICS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-session {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-top: 12px;
}

.three-lens-session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-session-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-session-duration {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
  padding: 2px 6px;
  background: rgba(34, 211, 238, 0.15);
  border-radius: 4px;
}

.three-lens-session-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.three-lens-session-stat {
  text-align: center;
  padding: 8px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-session-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.three-lens-session-stat-value.warning {
  color: var(--3lens-warning);
}

.three-lens-session-stat-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

.three-lens-session-peaks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-session-peak {
  flex: 1;
  min-width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-session-peak-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-session-peak-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 500;
}

.three-lens-session-peak-value.warning {
  color: var(--3lens-warning);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY EFFICIENCY
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-efficiency {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-efficiency-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.three-lens-memory-efficiency-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-efficiency-grade {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
}

.three-lens-memory-efficiency-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.three-lens-memory-efficiency-item {
  text-align: center;
  padding: 8px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-efficiency-value {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.three-lens-memory-efficiency-label {
  font-size: 8px;
  text-transform: uppercase;
  color: var(--3lens-text-disabled);
  margin-top: 2px;
}

.three-lens-memory-efficiency-bar {
  height: 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.three-lens-memory-efficiency-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 300ms ease;
}

.three-lens-memory-efficiency-score {
  font-size: 10px;
  text-align: right;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-memory-categories {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-categories-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 10px;
}

.three-lens-memory-category {
  padding: 10px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  margin-bottom: 8px;
}

.three-lens-memory-category:last-child {
  margin-bottom: 0;
}

.three-lens-memory-category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.three-lens-memory-category-icon {
  font-size: 14px;
}

.three-lens-memory-category-name {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.three-lens-memory-category-count {
  font-size: 12px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.three-lens-memory-category-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.three-lens-memory-category-segment {
  min-width: 4px;
}

.three-lens-memory-category-segment.small { background: var(--3lens-accent-emerald); }
.three-lens-memory-category-segment.medium { background: var(--3lens-accent-amber); }
.three-lens-memory-category-segment.large { background: var(--3lens-error); }

.three-lens-memory-category-legend {
  display: flex;
  gap: 10px;
  font-size: 9px;
}

.three-lens-memory-category-legend .small { color: var(--3lens-accent-emerald); }
.three-lens-memory-category-legend .medium { color: var(--3lens-accent-amber); }
.three-lens-memory-category-legend .large { color: var(--3lens-error); }

.three-lens-memory-category-details {
  display: flex;
  gap: 12px;
}

.three-lens-memory-category-detail {
  display: flex;
  gap: 6px;
  font-size: 10px;
}

.three-lens-memory-category-detail .label {
  color: var(--3lens-text-tertiary);
}

.three-lens-memory-category-detail .value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

.three-lens-memory-category-note {
  font-size: 10px;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-category-largest {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--3lens-border-subtle);
}

.three-lens-memory-category-largest strong {
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY TIPS
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE TIMELINE
   ═══════════════════════════════════════════════════════════════ */

.three-lens-timeline-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.three-lens-timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-timeline-left-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.three-lens-timeline-right-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-timeline-divider {
  width: 1px;
  height: 12px;
  background: var(--3lens-border);
  margin: 0 2px;
}

.three-lens-timeline-record-btn {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 9px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.three-lens-timeline-record-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border-hover);
}

.three-lens-timeline-record-btn.recording {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--3lens-error);
  color: var(--3lens-error);
  animation: pulse-recording 1s ease-in-out infinite;
}

@keyframes pulse-recording {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.three-lens-timeline-recording-info {
  font-size: 8px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.three-lens-timeline-buffer-select {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 8px;
  font-family: var(--3lens-font-mono);
  padding: 2px 4px;
  cursor: pointer;
}

.three-lens-timeline-buffer-select:hover {
  border-color: var(--3lens-border-hover);
}

.three-lens-timeline-btn {
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.three-lens-timeline-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border-hover);
  color: var(--3lens-text-primary);
}

.three-lens-timeline-zoom-label {
  font-size: 9px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  min-width: 28px;
  text-align: center;
}

.three-lens-timeline-stats {
  display: flex;
  gap: 10px;
}

.three-lens-timeline-stat {
  display: flex;
  gap: 3px;
  font-size: 9px;
}

.three-lens-timeline-stat-label {
  color: var(--3lens-text-tertiary);
}

.three-lens-timeline-stat-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
  font-weight: 600;
}

.three-lens-timeline-stat-value.warning {
  color: var(--3lens-accent-amber);
}

.three-lens-timeline-paused {
  font-size: 8px;
  color: var(--3lens-accent-cyan);
  background: var(--3lens-accent-cyan-dim);
  padding: 1px 5px;
  border-radius: var(--3lens-radius-sm);
  margin-left: 4px;
}

.three-lens-timeline-chart-container {
  flex: 1;
  position: relative;
  background: var(--3lens-bg-secondary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: var(--3lens-radius-sm);
  overflow: hidden;
  cursor: grab;
  min-height: 150px;
}

.three-lens-timeline-chart-container:active {
  cursor: grabbing;
}

.three-lens-timeline-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.three-lens-timeline-tooltip {
  position: absolute;
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  pointer-events: none;
  display: none;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.three-lens-timeline-tooltip div {
  padding: 2px 0;
}

.three-lens-timeline-legend {
  display: flex;
  gap: 10px;
  padding: 4px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  flex-wrap: wrap;
}

.three-lens-timeline-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 8px;
  color: var(--3lens-text-secondary);
}

.three-lens-timeline-legend-color {
  width: 8px;
  height: 8px;
  border-radius: 1px;
}

.three-lens-timeline-legend-color.cpu {
  background: rgba(96, 165, 250, 0.6);
}

.three-lens-timeline-legend-color.gpu {
  background: rgba(34, 197, 94, 0.6);
}

.three-lens-timeline-legend-color.spike {
  background: rgba(239, 68, 68, 0.8);
}

.three-lens-timeline-legend-color.selected {
  background: rgba(96, 165, 250, 1);
  border: 1px solid #fff;
}

.three-lens-timeline-frame-details {
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 6px 8px;
}

.three-lens-timeline-frame-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.three-lens-timeline-close-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 14px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--3lens-radius-sm);
  transition: all 0.2s;
}

.three-lens-timeline-close-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-timeline-frame-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.three-lens-timeline-frame-detail {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.three-lens-timeline-frame-detail-label {
  font-size: 7px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.three-lens-timeline-frame-detail-value {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
  font-weight: 600;
}

.three-lens-timeline-frame-detail-value.warning {
  color: var(--3lens-accent-amber);
}

.three-lens-timeline-frame-detail-value.error {
  color: var(--3lens-error);
}

.three-lens-memory-tips {
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: var(--3lens-radius-md);
  padding: 12px;
  margin-bottom: 12px;
}

.three-lens-memory-tips-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-accent-emerald);
  margin-bottom: 8px;
  font-weight: 600;
}

.three-lens-memory-tips-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-memory-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  border-left: 3px solid transparent;
}

.three-lens-memory-tip.high {
  border-left-color: var(--3lens-error);
}

.three-lens-memory-tip.medium {
  border-left-color: var(--3lens-warning);
}

.three-lens-memory-tip.low {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-memory-tip-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.three-lens-memory-tip-text {
  font-size: 10px;
  color: var(--3lens-text-secondary);
  line-height: 1.4;
}

/* ═══════════════════════════════════════════════════════════════
   RESOURCE LIFECYCLE TAB
   ═══════════════════════════════════════════════════════════════ */

.three-lens-resources-profiler {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
}

/* Resource Summary */
.three-lens-resource-summary {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-resource-summary-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.three-lens-resource-summary-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-resource-summary-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-resource-summary-icon {
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.three-lens-resource-summary-icon.geometry { background: rgba(96, 165, 250, 0.2); }
.three-lens-resource-summary-icon.material { background: rgba(167, 139, 250, 0.2); }
.three-lens-resource-summary-icon.texture { background: rgba(52, 211, 153, 0.2); }

.three-lens-resource-summary-details {
  flex: 1;
}

.three-lens-resource-summary-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.three-lens-resource-summary-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 9px;
}

.three-lens-resource-summary-stats span {
  padding: 1px 4px;
  border-radius: 2px;
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-tertiary);
}

.three-lens-resource-summary-stats .created { color: var(--3lens-accent-green); }
.three-lens-resource-summary-stats .disposed { color: var(--3lens-text-disabled); }
.three-lens-resource-summary-stats .active.highlight { color: var(--3lens-accent-cyan); font-weight: 600; }
.three-lens-resource-summary-stats .leaked { color: var(--3lens-accent-red); background: rgba(239, 68, 68, 0.2); }

.three-lens-resource-total-events {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  margin-top: 6px;
}

/* Resource Controls */
.three-lens-resource-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

/* Potential Leaks */
.three-lens-potential-leaks {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-potential-leaks-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
  margin-bottom: 6px;
}

.three-lens-potential-leaks-icon {
  font-size: 12px;
}

.three-lens-potential-leaks-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.three-lens-leak-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  font-size: 9px;
}

.three-lens-leak-type {
  font-size: 10px;
}

.three-lens-leak-type.geometry { color: #60a5fa; }
.three-lens-leak-type.material { color: #a78bfa; }
.three-lens-leak-type.texture { color: #34d399; }

.three-lens-leak-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-leak-age {
  color: var(--3lens-accent-red);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-leak-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* Resource Timeline */
.three-lens-resource-timeline {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-resource-timeline-empty {
  text-align: center;
  padding: 20px;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
}

.three-lens-resource-timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

.three-lens-resource-timeline-legend {
  display: flex;
  gap: 8px;
}

.three-lens-resource-timeline-legend span {
  font-size: 8px;
}

.three-lens-resource-timeline-legend .geometry { color: #60a5fa; }
.three-lens-resource-timeline-legend .material { color: #a78bfa; }
.three-lens-resource-timeline-legend .texture { color: #34d399; }
.three-lens-resource-timeline-legend .disposed { color: #ef4444; }

.three-lens-resource-timeline-chart {
  display: flex;
  height: 60px;
  gap: 1px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  padding: 2px;
}

.three-lens-resource-timeline-bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  min-width: 4px;
}

.three-lens-resource-bar-stack {
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 1px;
  overflow: hidden;
}

.three-lens-resource-bar-segment {
  min-height: 2px;
}

.three-lens-resource-bar-segment.geometry { background: #60a5fa; }
.three-lens-resource-bar-segment.material { background: #a78bfa; }
.three-lens-resource-bar-segment.texture { background: #34d399; }
.three-lens-resource-bar-segment.disposed { background: #ef4444; }

.three-lens-resource-timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

/* Resource Event List */
.three-lens-resource-event-list {
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.three-lens-resource-event-list-header {
  font-size: 9px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  margin-bottom: 6px;
}

.three-lens-resource-event-list-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.three-lens-resource-event-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  font-size: 9px;
}

.three-lens-resource-event-item.disposed {
  opacity: 0.7;
}

.three-lens-resource-event-type {
  font-size: 10px;
}

.three-lens-resource-event-type.geometry { color: #60a5fa; }
.three-lens-resource-event-type.material { color: #a78bfa; }
.three-lens-resource-event-type.texture { color: #34d399; }

.three-lens-resource-event-action {
  font-weight: 600;
  width: 12px;
  text-align: center;
}

.three-lens-resource-event-action.created { color: var(--3lens-accent-green); }
.three-lens-resource-event-action.disposed { color: var(--3lens-accent-red); }
.three-lens-resource-event-action.attached { color: var(--3lens-accent-cyan); }
.three-lens-resource-event-action.detached { color: var(--3lens-accent-orange); }

.three-lens-resource-event-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-resource-event-slot {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-tertiary);
  padding: 1px 3px;
  border-radius: 2px;
}

.three-lens-resource-event-time {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-resource-event-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   LEAK DETECTION UI
   ═══════════════════════════════════════════════════════════════ */

.three-lens-resource-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-leak-controls-left {
  display: flex;
  gap: 4px;
}

.three-lens-leak-controls-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.three-lens-action-btn.small {
  padding: 2px 6px;
  font-size: 10px;
  min-width: unset;
}

.three-lens-toggle-row.compact {
  gap: 4px;
}

.three-lens-toggle-row.compact .three-lens-toggle-label {
  font-size: 9px;
}

/* Memory Usage */
.three-lens-memory-usage {
  padding: 6px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: var(--3lens-radius-sm);
}

.three-lens-memory-usage-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.three-lens-memory-usage-label {
  font-size: 9px;
  color: var(--3lens-text-secondary);
}

.three-lens-memory-usage-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-memory-trend {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
}

.three-lens-memory-trend.growing {
  color: var(--3lens-accent-red);
  background: rgba(239, 68, 68, 0.2);
}

.three-lens-memory-trend.shrinking {
  color: var(--3lens-accent-green);
  background: rgba(52, 211, 153, 0.2);
}

.three-lens-memory-trend.stable {
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-secondary);
}

/* Leak Alerts */
.three-lens-leak-alerts {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-leak-alerts-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
  margin-bottom: 6px;
}

.three-lens-leak-alerts-icon {
  font-size: 12px;
}

.three-lens-alert-badge {
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: 600;
}

.three-lens-alert-badge.critical {
  background: var(--3lens-accent-red);
  color: white;
}

.three-lens-alert-badge.warning {
  background: var(--3lens-accent-orange);
  color: white;
}

.three-lens-leak-alerts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.three-lens-leak-alert-item {
  display: flex;
  gap: 6px;
  padding: 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  border-left: 2px solid transparent;
}

.three-lens-leak-alert-item.critical {
  border-left-color: var(--3lens-accent-red);
}

.three-lens-leak-alert-item.warning {
  border-left-color: var(--3lens-accent-orange);
}

.three-lens-leak-alert-item.info {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-alert-severity {
  font-size: 10px;
  flex-shrink: 0;
}

.three-lens-alert-content {
  flex: 1;
  min-width: 0;
}

.three-lens-alert-message {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.three-lens-alert-details {
  font-size: 9px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
}

.three-lens-alert-suggestion {
  font-size: 8px;
  color: var(--3lens-accent-cyan);
  background: rgba(34, 211, 238, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

/* Orphaned Resources */
.three-lens-orphaned-resources {
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
}

.three-lens-orphaned-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #a78bfa;
  margin-bottom: 4px;
}

.three-lens-orphaned-icon {
  font-size: 12px;
}

.three-lens-orphaned-hint {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 6px;
}

.three-lens-orphaned-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.three-lens-orphan-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  background: var(--3lens-bg-secondary);
  border-radius: 2px;
  font-size: 9px;
}

.three-lens-orphan-type {
  font-size: 10px;
}

.three-lens-orphan-type.geometry { color: #60a5fa; }
.three-lens-orphan-type.material { color: #a78bfa; }
.three-lens-orphan-type.texture { color: #34d399; }

.three-lens-orphan-name {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-orphan-age {
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-orphan-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

.three-lens-leak-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
}

/* ═══════════════════════════════════════════════════════════════
   RULE VIOLATIONS UI
   ═══════════════════════════════════════════════════════════════ */

.three-lens-rule-violations {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--3lens-radius-sm);
  padding: 8px;
  margin-top: 8px;
}

.three-lens-rule-violations-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.three-lens-rule-violations-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-accent-red);
}

.three-lens-rule-violations-badges {
  display: flex;
  gap: 4px;
  flex: 1;
}

.three-lens-violation-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  font-weight: 600;
}

.three-lens-violation-badge.error {
  background: var(--3lens-accent-red);
  color: white;
}

.three-lens-violation-badge.warning {
  background: var(--3lens-accent-orange);
  color: white;
}

.three-lens-rule-violations-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.three-lens-violation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: var(--3lens-radius-sm);
  border-left: 2px solid transparent;
  font-size: 9px;
}

.three-lens-violation-item.error {
  border-left-color: var(--3lens-accent-red);
}

.three-lens-violation-item.warning {
  border-left-color: var(--3lens-accent-orange);
}

.three-lens-violation-item.info {
  border-left-color: var(--3lens-accent-blue);
}

.three-lens-violation-severity {
  font-size: 10px;
  flex-shrink: 0;
}

.three-lens-violation-message {
  flex: 1;
  color: var(--3lens-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.three-lens-violation-time {
  font-size: 8px;
  color: var(--3lens-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.three-lens-violations-more {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 4px 0;
  margin-top: 4px;
}

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */

.three-lens-toast-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  z-index: 10000000;
  pointer-events: none;
}

.three-lens-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--3lens-bg-elevated);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  font-family: var(--3lens-font-sans);
  font-size: 12px;
  color: var(--3lens-text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  pointer-events: auto;
}

.three-lens-toast.visible {
  transform: translateX(0);
  opacity: 1;
}

.three-lens-toast-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
}

.three-lens-toast-info .three-lens-toast-icon {
  background: var(--3lens-accent-blue);
  color: white;
}

.three-lens-toast-success .three-lens-toast-icon {
  background: var(--3lens-success);
  color: white;
}

.three-lens-toast-warning .three-lens-toast-icon {
  background: var(--3lens-warning);
  color: black;
}

.three-lens-toast-error .three-lens-toast-icon {
  background: var(--3lens-error);
  color: white;
}

.three-lens-toast-message {
  flex: 1;
}

/* ═══════════════════════════════════════════════════════════════
   PLUGIN PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

.three-lens-menu-icon.plugin {
  background: linear-gradient(135deg, var(--3lens-accent-violet), var(--3lens-accent-rose));
  color: white;
}

.plugin-error {
  padding: 16px;
  text-align: center;
  color: var(--3lens-error);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
}

.plugin-loading {
  padding: 16px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  font-family: var(--3lens-font-sans);
}

/* Plugin toolbar button */
.three-lens-plugin-toolbar {
  display: flex;
  gap: 2px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--3lens-border);
}

.three-lens-plugin-toolbar-btn {
  background: transparent;
  border: none;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: var(--3lens-text-secondary);
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-toolbar-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-plugin-toolbar-btn.active {
  background: var(--3lens-accent-blue);
  color: white;
}

.three-lens-plugin-toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════════════════
   PLUGINS MANAGEMENT PANEL
   ═══════════════════════════════════════════════════════════════ */

.three-lens-plugins-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
}

.three-lens-plugins-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugins-count {
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.three-lens-plugins-btn {
  background: var(--3lens-accent-blue);
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.three-lens-plugins-btn:hover {
  background: #3b82f6;
}

.three-lens-plugins-btn.primary {
  background: var(--3lens-accent-blue);
}

.three-lens-plugins-btn.danger {
  background: var(--3lens-error);
}

.three-lens-plugins-btn.danger:hover {
  background: #dc2626;
}

.three-lens-plugins-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.three-lens-plugins-empty {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  padding: 24px;
}

.three-lens-plugin-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.three-lens-plugin-item:hover {
  background: var(--3lens-bg-hover);
}

.three-lens-plugin-item.selected {
  border-color: var(--3lens-accent-blue);
  background: rgba(96, 165, 250, 0.1);
}

.three-lens-plugin-item.error {
  border-color: var(--3lens-error);
}

.three-lens-plugin-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.three-lens-plugin-info {
  flex: 1;
  min-width: 0;
}

.three-lens-plugin-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.three-lens-plugin-version {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
}

.three-lens-plugin-status {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border-radius: 50%;
}

.three-lens-plugin-status.active {
  color: var(--3lens-success);
}

.three-lens-plugin-status.inactive {
  color: var(--3lens-text-tertiary);
}

.three-lens-plugin-status.error {
  color: var(--3lens-error);
  font-weight: bold;
}

.three-lens-plugin-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.three-lens-plugin-item:hover .three-lens-plugin-actions {
  opacity: 1;
}

.three-lens-plugin-action-btn {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-action-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

/* Plugin Load Form */
.three-lens-plugin-load-form {
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.three-lens-plugin-form-group {
  margin-bottom: 10px;
}

.three-lens-plugin-label {
  display: block;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.three-lens-plugin-input {
  width: 100%;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  box-sizing: border-box;
}

.three-lens-plugin-input:focus {
  outline: none;
  border-color: var(--3lens-accent-blue);
}

.three-lens-plugin-select {
  width: 100%;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-size: 11px;
  cursor: pointer;
}

.three-lens-plugin-submit-btn {
  width: 100%;
  padding: 8px;
  background: var(--3lens-accent-blue);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.three-lens-plugin-submit-btn:hover {
  background: #3b82f6;
}

.three-lens-plugin-load-status {
  margin-top: 8px;
  font-size: 10px;
  text-align: center;
}

.three-lens-plugin-load-status .loading {
  color: var(--3lens-text-secondary);
}

.three-lens-plugin-load-status .success {
  color: var(--3lens-success);
}

.three-lens-plugin-load-status .error {
  color: var(--3lens-error);
}

/* Plugin Settings */
.three-lens-plugin-settings {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.three-lens-plugin-settings-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugin-back-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.three-lens-plugin-back-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.three-lens-plugin-settings-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
}

.three-lens-plugin-details {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.three-lens-plugin-description {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.three-lens-plugin-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

.three-lens-plugin-settings-fields {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.three-lens-plugin-setting-field {
  margin-bottom: 12px;
}

.three-lens-plugin-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.three-lens-plugin-setting-label {
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.three-lens-plugin-setting-desc {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  margin-top: 4px;
}

.three-lens-plugin-no-settings {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 11px;
  padding: 24px;
}

.three-lens-plugin-settings-actions {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.three-lens-plugin-color {
  width: 40px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  cursor: pointer;
}

/* ═══════════════════════════════════════════════════════════════
   LOD CHECKER PLUGIN STYLES
   ═══════════════════════════════════════════════════════════════ */

.lod-checker-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.lod-checker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.lod-checker-title {
  font-weight: 600;
  font-size: 12px;
}

.lod-checker-btn {
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.lod-checker-btn:hover {
  background: var(--3lens-bg-hover);
}

.lod-checker-btn.primary {
  background: var(--3lens-accent-blue);
  border-color: var(--3lens-accent-blue);
  color: white;
}

.lod-checker-btn.primary:hover {
  background: #3b82f6;
}

.lod-checker-empty {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-secondary);
}

.lod-checker-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 8px;
}

.lod-checker-summary {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
  flex-wrap: wrap;
}

.lod-checker-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
}

.lod-checker-stat.warning {
  background: rgba(251, 191, 36, 0.15);
}

.lod-checker-stat.info {
  background: rgba(96, 165, 250, 0.15);
}

.lod-checker-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.lod-checker-stat.warning .lod-checker-stat-value {
  color: var(--3lens-warning);
}

.lod-checker-stat-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.lod-checker-analysis-time {
  padding: 4px 12px;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-align: right;
}

.lod-checker-section {
  padding: 10px 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.lod-checker-section-header {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 11px;
}

.lod-checker-section-header.warning {
  color: var(--3lens-warning);
}

.lod-checker-section-header.info {
  color: var(--3lens-accent-blue);
}

.lod-checker-section-desc {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

.lod-checker-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lod-checker-list.scrollable {
  max-height: 200px;
  overflow-y: auto;
}

.lod-checker-item {
  padding: 8px 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.lod-checker-item:hover {
  background: var(--3lens-bg-hover);
}

.lod-checker-item.warning {
  border-color: var(--3lens-warning);
  border-left-width: 3px;
}

.lod-checker-item.info {
  border-color: var(--3lens-accent-blue);
  border-left-width: 3px;
}

.lod-checker-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.lod-checker-item-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lod-checker-item-badges {
  display: flex;
  gap: 4px;
}

.lod-checker-badge {
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.lod-checker-badge.lod {
  background: var(--3lens-accent-emerald);
  color: black;
}

.lod-checker-badge.over {
  background: var(--3lens-warning);
  color: black;
}

.lod-checker-badge.far {
  background: var(--3lens-accent-blue);
  color: white;
}

.lod-checker-item-stats {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
}

.lod-checker-item-stats .highlight {
  color: var(--3lens-warning);
  font-weight: 600;
}

.lod-checker-item-suggestion {
  margin-top: 4px;
  font-size: 9px;
  color: var(--3lens-accent-blue);
}

.lod-checker-success {
  padding: 16px;
  text-align: center;
  color: var(--3lens-success);
  font-size: 12px;
}

.lod-checker-more {
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  padding: 8px;
}

/* ═══════════════════════════════════════════════════════════════
   SHADOW DEBUGGER PLUGIN STYLES
   ═══════════════════════════════════════════════════════════════ */

.shadow-debugger-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--3lens-font-sans);
  font-size: 11px;
  color: var(--3lens-text-primary);
}

.shadow-debugger-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.shadow-debugger-title {
  font-weight: 600;
  font-size: 12px;
}

.shadow-debugger-btn {
  background: var(--3lens-bg-tertiary);
  color: var(--3lens-text-primary);
  border: 1px solid var(--3lens-border);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.shadow-debugger-btn:hover {
  background: var(--3lens-bg-hover);
}

.shadow-debugger-btn.primary {
  background: var(--3lens-accent-blue);
  border-color: var(--3lens-accent-blue);
  color: white;
}

.shadow-debugger-btn.primary:hover {
  background: #3b82f6;
}

.shadow-debugger-empty {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-secondary);
}

.shadow-debugger-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 8px;
}

.shadow-debugger-summary {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
  flex-wrap: wrap;
}

.shadow-debugger-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 4px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
}

.shadow-debugger-stat.warning {
  background: rgba(251, 191, 36, 0.15);
}

.shadow-debugger-stat.error {
  background: rgba(239, 68, 68, 0.15);
}

.shadow-debugger-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.shadow-debugger-stat.warning .shadow-debugger-stat-value {
  color: var(--3lens-warning);
}

.shadow-debugger-stat.error .shadow-debugger-stat-value {
  color: var(--3lens-error);
}

.shadow-debugger-stat-label {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.shadow-debugger-section {
  padding: 10px 12px;
  border-bottom: 1px solid var(--3lens-border);
}

.shadow-debugger-section-header {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 11px;
}

.shadow-debugger-section-header.warning {
  color: var(--3lens-warning);
}

.shadow-debugger-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shadow-debugger-item {
  padding: 10px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.shadow-debugger-item:hover {
  background: var(--3lens-bg-hover);
}

.shadow-debugger-item.warning {
  border-color: var(--3lens-warning);
  border-left-width: 3px;
}

.shadow-debugger-item.error {
  border-color: var(--3lens-error);
  border-left-width: 3px;
}

.shadow-debugger-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.shadow-debugger-item-icon {
  font-size: 14px;
}

.shadow-debugger-item-name {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shadow-debugger-item-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  padding: 2px 6px;
  background: var(--3lens-bg-secondary);
  border-radius: 3px;
}

.shadow-debugger-item-issues {
  font-size: 9px;
  color: var(--3lens-warning);
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.15);
  border-radius: 3px;
}

.shadow-debugger-item-stats {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  font-family: var(--3lens-font-mono);
  flex-wrap: wrap;
}

.shadow-debugger-item-issues-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shadow-debugger-issue {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.shadow-debugger-issue.warning {
  background: rgba(251, 191, 36, 0.1);
}

.shadow-debugger-issue.error {
  background: rgba(239, 68, 68, 0.1);
}

.shadow-debugger-issue.info {
  background: rgba(96, 165, 250, 0.1);
}

.shadow-debugger-issue-icon {
  flex-shrink: 0;
}

.shadow-debugger-issue-content {
  flex: 1;
}

.shadow-debugger-issue-message {
  color: var(--3lens-text-primary);
  margin-bottom: 2px;
}

.shadow-debugger-issue-suggestion {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

.shadow-debugger-success {
  padding: 16px;
  text-align: center;
  color: var(--3lens-success);
  font-size: 12px;
}

.shadow-debugger-info {
  padding: 16px;
  text-align: center;
  color: var(--3lens-text-secondary);
  font-size: 12px;
}

/* ═══════════════════════════════════════════════════════════════
   WEBGPU PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

.webgpu-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.webgpu-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-tab {
  padding: 6px 12px;
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 10px;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  transition: all 0.15s ease;
}

.webgpu-tab:hover {
  color: var(--3lens-text-primary);
  background: var(--3lens-bg-tertiary);
}

.webgpu-tab.active {
  background: var(--3lens-bg-primary);
  color: var(--3lens-accent);
  font-weight: 500;
}

.webgpu-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* Not Available State */
.webgpu-not-available {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.webgpu-not-available-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.webgpu-not-available-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.webgpu-not-available-desc {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  max-width: 300px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.webgpu-not-available-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-secondary);
  padding: 8px 12px;
  border-radius: 4px;
}

.webgpu-not-available-hint code {
  background: var(--3lens-bg-tertiary);
  padding: 1px 4px;
  border-radius: 2px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
}

/* Section */
.webgpu-section {
  margin-bottom: 16px;
}

.webgpu-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-badge {
  background: var(--3lens-accent);
  color: #000;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
}

/* Pipeline List */
.webgpu-pipeline-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.webgpu-pipeline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.webgpu-pipeline-item:hover {
  background: var(--3lens-bg-tertiary);
}

.webgpu-pipeline-item.selected {
  background: var(--3lens-accent);
  color: #000;
}

.webgpu-pipeline-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.webgpu-pipeline-name {
  flex: 1;
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.webgpu-pipeline-type {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
}

.webgpu-pipeline-item.selected .webgpu-pipeline-type {
  color: rgba(0, 0, 0, 0.6);
}

.webgpu-pipeline-usage {
  font-size: 9px;
  color: var(--3lens-text-tertiary);
}

.webgpu-pipeline-item.selected .webgpu-pipeline-usage {
  color: rgba(0, 0, 0, 0.6);
}

/* Pipeline Details */
.webgpu-pipeline-details {
  margin-top: 16px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border);
  overflow: hidden;
}

.webgpu-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-details-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--3lens-text-primary);
}

.webgpu-close-btn {
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.webgpu-close-btn:hover {
  color: var(--3lens-text-primary);
}

.webgpu-details-content {
  padding: 12px;
}

.webgpu-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 10px;
}

.webgpu-detail-label {
  color: var(--3lens-text-secondary);
}

.webgpu-detail-value {
  color: var(--3lens-text-primary);
}

.webgpu-detail-value.mono {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 9px;
}

.webgpu-shader-stage {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--3lens-border);
}

.webgpu-shader-stage-header {
  font-size: 10px;
  font-weight: 600;
  color: var(--3lens-text-secondary);
  margin-bottom: 6px;
}

.webgpu-shader-stage-entry {
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--3lens-accent);
  background: var(--3lens-bg-tertiary);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Bind Groups */
.webgpu-bindgroups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-info {
  text-align: center;
  padding: 20px;
}

.webgpu-info-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.webgpu-info-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.webgpu-info-desc {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
  max-width: 320px;
  margin: 0 auto;
}

.webgpu-bindgroup-types {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webgpu-bindgroup-type {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
}

.webgpu-bindgroup-type-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.webgpu-bindgroup-type-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  min-width: 120px;
}

.webgpu-bindgroup-type-desc {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

/* Shaders */
.webgpu-shaders {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-shader-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.webgpu-shader-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.webgpu-shader-item:hover {
  background: var(--3lens-bg-tertiary);
}

.webgpu-shader-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.webgpu-shader-name {
  flex: 1;
  font-size: 10px;
  font-family: 'SF Mono', Monaco, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.webgpu-shader-stages {
  display: flex;
  gap: 4px;
}

.webgpu-stage-badge {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.webgpu-stage-badge.vs {
  background: rgba(96, 165, 250, 0.2);
  color: #60A5FA;
}

.webgpu-stage-badge.fs {
  background: rgba(251, 146, 60, 0.2);
  color: #FB923C;
}

.webgpu-stage-badge.cs {
  background: rgba(52, 211, 153, 0.2);
  color: #34D399;
}

.webgpu-info-box {
  background: var(--3lens-bg-secondary);
  padding: 12px;
  border-radius: 6px;
  font-size: 10px;
  color: var(--3lens-text-secondary);
  line-height: 1.5;
}

.webgpu-info-box p {
  margin: 0 0 8px;
}

.webgpu-info-box p:last-child {
  margin-bottom: 0;
}

.webgpu-info-box strong {
  color: var(--3lens-accent);
}

.webgpu-info-box ul {
  margin: 8px 0 0;
  padding-left: 16px;
}

.webgpu-info-box li {
  margin-bottom: 4px;
}

/* Capabilities */
.webgpu-capabilities {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webgpu-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.webgpu-stat {
  text-align: center;
  padding: 12px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
}

.webgpu-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--3lens-accent);
  font-family: 'SF Mono', Monaco, monospace;
}

.webgpu-stat-label {
  display: block;
  font-size: 9px;
  color: var(--3lens-text-tertiary);
  text-transform: uppercase;
  margin-top: 4px;
}

.webgpu-limits-info {
  margin-bottom: 8px;
}

.webgpu-limits-info code {
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 9px;
  color: var(--3lens-accent);
}

.webgpu-limits-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.webgpu-limit {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: var(--3lens-bg-secondary);
  border-radius: 4px;
  font-size: 10px;
}

.webgpu-limit-name {
  color: var(--3lens-text-secondary);
}

.webgpu-limit-value {
  color: var(--3lens-text-primary);
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 500;
}

/* Comparison Table */
.webgpu-comparison {
  background: var(--3lens-bg-secondary);
  border-radius: 6px;
  overflow: hidden;
}

.webgpu-compare-row {
  display: grid;
  grid-template-columns: 1fr 60px 60px;
  padding: 8px 12px;
  font-size: 10px;
  border-bottom: 1px solid var(--3lens-border);
}

.webgpu-compare-row:last-child {
  border-bottom: none;
}

.webgpu-compare-row.header {
  background: var(--3lens-bg-tertiary);
  font-weight: 600;
  color: var(--3lens-text-secondary);
  text-transform: uppercase;
  font-size: 9px;
}

.webgpu-compare-row span:nth-child(2),
.webgpu-compare-row span:nth-child(3) {
  text-align: center;
}

.webgpu-compare-row .yes {
  color: var(--3lens-success);
}

.webgpu-compare-row .no {
  color: var(--3lens-text-tertiary);
}

.webgpu-compare-row .partial {
  color: var(--3lens-warning);
}

/* Empty States */
.webgpu-empty {
  text-align: center;
  padding: 24px;
  color: var(--3lens-text-secondary);
}

.webgpu-empty p {
  margin: 0 0 8px;
  font-size: 11px;
}

.webgpu-empty-small {
  padding: 12px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-style: italic;
}

.webgpu-hint {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
}
`;
