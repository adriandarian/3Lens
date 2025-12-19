/**
 * 3Lens DevTools Panel
 */

import type { DebugMessage, FrameStats, SceneSnapshot, SceneNode } from '@3lens/core';

// ───────────────────────────────────────────────────────────────
// State
// ───────────────────────────────────────────────────────────────

interface PanelState {
  connected: boolean;
  activeTab: 'scene' | 'stats' | 'inspector' | 'textures' | 'materials';
  snapshot: SceneSnapshot | null;
  latestStats: FrameStats | null;
  selectedNodeId: string | null;
  expandedNodes: Set<string>;
  frameHistory: number[];
}

const state: PanelState = {
  connected: false,
  activeTab: 'scene',
  snapshot: null,
  latestStats: null,
  selectedNodeId: null,
  expandedNodes: new Set(),
  frameHistory: [],
};

// ───────────────────────────────────────────────────────────────
// Communication
// ───────────────────────────────────────────────────────────────

// Set up port connection to background script
const port = chrome.runtime.connect({ name: 'panel' });

port.onMessage.addListener((message: DebugMessage) => {
  handleMessage(message);
});

port.onDisconnect.addListener(() => {
  updateConnectionStatus(false);
});

// Request initial state
port.postMessage({ type: 'handshake-request', uiVersion: '0.1.0', capabilities: [] });

function handleMessage(message: DebugMessage): void {
  switch (message.type) {
    case 'handshake-response':
      updateConnectionStatus(true);
      requestSnapshot();
      break;

    case 'frame-stats':
      state.latestStats = message.stats;
      state.frameHistory.push(message.stats.cpuTimeMs);
      if (state.frameHistory.length > 60) state.frameHistory.shift();
      if (state.activeTab === 'stats') renderStats();
      break;

    case 'snapshot':
      state.snapshot = message.snapshot;
      if (state.activeTab === 'scene') renderScene();
      break;
  }
}

function requestSnapshot(): void {
  port.postMessage({ type: 'request-snapshot' });
}

// ───────────────────────────────────────────────────────────────
// UI Updates
// ───────────────────────────────────────────────────────────────

function updateConnectionStatus(connected: boolean): void {
  state.connected = connected;
  const statusEl = document.getElementById('connection-status');
  const dotEl = statusEl?.querySelector('.status-dot');
  const textEl = statusEl?.querySelector('.status-text');

  if (dotEl) {
    dotEl.classList.toggle('connected', connected);
    dotEl.classList.toggle('disconnected', !connected);
  }

  if (textEl) {
    textEl.textContent = connected ? 'Connected' : 'Disconnected';
  }

  if (connected) {
    hideEmptyState();
  }
}

function hideEmptyState(): void {
  const emptyState = document.getElementById('empty-state');
  if (emptyState) emptyState.style.display = 'none';
}

// ───────────────────────────────────────────────────────────────
// Tab Handling
// ───────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    const tabId = target.dataset.tab as PanelState['activeTab'];

    // Update active tab
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    target.classList.add('active');

    state.activeTab = tabId;
    renderContent();
  });
});

// ───────────────────────────────────────────────────────────────
// Rendering
// ───────────────────────────────────────────────────────────────

function renderContent(): void {
  switch (state.activeTab) {
    case 'scene':
      renderScene();
      break;
    case 'stats':
      renderStats();
      break;
    case 'inspector':
      renderInspector();
      break;
    default:
      renderPlaceholder();
  }
}

function renderScene(): void {
  const content = document.getElementById('content');
  if (!content) return;

  if (!state.snapshot?.scenes.length) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌲</div>
        <h2>No Scenes</h2>
        <p>No scenes are being observed.</p>
      </div>
    `;
    return;
  }

  const html = `
    <div class="scene-tree">
      ${state.snapshot.scenes.map((scene) => renderNode(scene)).join('')}
    </div>
  `;

  content.innerHTML = html;
  attachTreeEvents();
}

function renderNode(node: SceneNode): string {
  const hasChildren = node.children.length > 0;
  const isExpanded = state.expandedNodes.has(node.ref.debugId);
  const isSelected = state.selectedNodeId === node.ref.debugId;
  const iconClass = getIconClass(node.ref.type);

  return `
    <div class="tree-node" data-id="${node.ref.debugId}">
      <div class="node-header ${isSelected ? 'selected' : ''}">
        <span class="node-toggle ${hasChildren ? (isExpanded ? 'expanded' : '') : ''}" style="${hasChildren ? '' : 'visibility:hidden'}">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <path d="M2 1L6 4L2 7z"/>
          </svg>
        </span>
        <span class="node-icon ${iconClass}">${getIcon(node.ref.type)}</span>
        <span class="node-name">${node.ref.name || `<${node.ref.type}>`}</span>
        <span class="node-type">${node.ref.type}</span>
      </div>
      ${
        hasChildren && isExpanded
          ? `<div class="node-children">${node.children.map((c) => renderNode(c)).join('')}</div>`
          : ''
      }
    </div>
  `;
}

function renderStats(): void {
  const content = document.getElementById('content');
  if (!content) return;

  const stats = state.latestStats;
  if (!stats) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h2>No Stats Yet</h2>
        <p>Waiting for frame data...</p>
      </div>
    `;
    return;
  }

  const fps = stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0;

  content.innerHTML = `
    <div class="stats-panel">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">FPS</div>
          <div class="stat-value">${fps}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Frame Time</div>
          <div class="stat-value">${stats.cpuTimeMs.toFixed(1)}<span class="stat-unit">ms</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Draw Calls</div>
          <div class="stat-value ${stats.drawCalls > 1000 ? 'warning' : ''}">${formatNumber(stats.drawCalls)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Triangles</div>
          <div class="stat-value ${stats.triangles > 500000 ? 'warning' : ''}">${formatNumber(stats.triangles)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderInspector(): void {
  const content = document.getElementById('content');
  if (!content) return;

  if (!state.selectedNodeId) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔎</div>
        <h2>No Selection</h2>
        <p>Select an object in the Scene tab to inspect its properties.</p>
      </div>
    `;
    return;
  }

  // Find the selected node in the snapshot
  const node = findNode(state.snapshot?.scenes ?? [], state.selectedNodeId);
  if (!node) {
    content.innerHTML = `<div class="empty-state"><p>Object not found</p></div>`;
    return;
  }

  content.innerHTML = `
    <div class="inspector-panel" style="padding: 12px;">
      <h3 style="margin-bottom: 12px; font-size: 14px; color: var(--accent-cyan);">
        ${node.ref.name || node.ref.type}
      </h3>
      <div class="property-section">
        <div class="property-row">
          <span class="property-name" style="color: var(--text-tertiary); width: 80px; display: inline-block;">Type</span>
          <span class="property-value" style="font-family: var(--font-mono);">${node.ref.type}</span>
        </div>
        <div class="property-row">
          <span class="property-name" style="color: var(--text-tertiary); width: 80px; display: inline-block;">UUID</span>
          <span class="property-value" style="font-family: var(--font-mono); font-size: 10px;">${node.ref.threeUuid}</span>
        </div>
        <div class="property-row">
          <span class="property-name" style="color: var(--text-tertiary); width: 80px; display: inline-block;">Visible</span>
          <span class="property-value">${node.visible ? '✓' : '✗'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderPlaceholder(): void {
  const content = document.getElementById('content');
  if (!content) return;

  content.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🚧</div>
      <h2>Coming Soon</h2>
      <p>This panel is under development.</p>
    </div>
  `;
}

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

function attachTreeEvents(): void {
  document.querySelectorAll('.node-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      const node = (header as HTMLElement).parentElement;
      const id = node?.dataset.id;
      if (!id) return;

      // Check if clicking toggle
      const toggle = (e.target as HTMLElement).closest('.node-toggle');
      if (toggle && toggle.getAttribute('style') !== 'visibility:hidden') {
        if (state.expandedNodes.has(id)) {
          state.expandedNodes.delete(id);
        } else {
          state.expandedNodes.add(id);
        }
        renderScene();
        return;
      }

      // Select node
      state.selectedNodeId = id;
      port.postMessage({ type: 'select-object', debugId: id });
      renderScene();
    });
  });
}

function findNode(nodes: SceneNode[], id: string): SceneNode | null {
  for (const node of nodes) {
    if (node.ref.debugId === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

function getIconClass(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('scene')) return 'scene';
  if (lower.includes('mesh')) return 'mesh';
  if (lower.includes('group')) return 'group';
  if (lower.includes('light')) return 'light';
  if (lower.includes('camera')) return 'camera';
  return 'mesh';
}

function getIcon(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('scene')) return 'S';
  if (lower.includes('mesh')) return 'M';
  if (lower.includes('group')) return 'G';
  if (lower.includes('light')) return 'L';
  if (lower.includes('camera')) return 'C';
  return 'O';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Initial render
renderContent();

