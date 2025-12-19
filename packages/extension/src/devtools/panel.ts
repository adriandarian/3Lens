/**
 * 3Lens DevTools Panel
 */

import type { DebugMessage, FrameStats, SceneSnapshot, SceneNode } from '@3lens/core';

// ───────────────────────────────────────────────────────────────
// State
// ───────────────────────────────────────────────────────────────

interface PanelState {
  connected: boolean;
  activeTab: 'scene' | 'stats' | 'textures' | 'materials';
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
const tabId = chrome.devtools.inspectedWindow.tabId;

port.onMessage.addListener((message: DebugMessage) => {
  handleMessage(message);
});

port.onDisconnect.addListener(() => {
  updateConnectionStatus(false);
});

// Request initial state - include tabId so background can route messages
port.postMessage({ type: 'handshake-request', uiVersion: '0.1.0', capabilities: [], tabId });

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

  // Find selected node for the inspector panel
  const selectedNode = state.selectedNodeId 
    ? findNode(state.snapshot.scenes, state.selectedNodeId) 
    : null;

  const html = `
    <div class="scene-split-view">
      <div class="scene-tree-panel">
        <div class="scene-tree">
          ${state.snapshot.scenes.map((scene) => renderNode(scene)).join('')}
        </div>
      </div>
      <div class="scene-inspector-panel">
        ${selectedNode ? renderInspectorContent(selectedNode) : renderNoSelectionHint()}
      </div>
    </div>
  `;

  content.innerHTML = html;
  attachTreeEvents();
}

function renderInspectorContent(node: SceneNode): string {
  const transform = node.transform;
  
  return `
    <div class="inspector-header">
      <span class="inspector-icon ${getIconClass(node.ref.type)}">${getIcon(node.ref.type)}</span>
      <span class="inspector-title">${node.ref.name || `<${node.ref.type}>`}</span>
      <span class="inspector-uuid">${node.ref.threeUuid.substring(0, 8)}</span>
    </div>

    <div class="inspector-section">
      <div class="section-title">Transform</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Position</span>
          <span class="property-value vector">${formatVector(transform.position)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Rotation</span>
          <span class="property-value vector">${formatEuler(transform.rotation)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Scale</span>
          <span class="property-value vector">${formatVector(transform.scale)}</span>
        </div>
      </div>
    </div>

    ${node.meshData ? renderMeshSection(node.meshData) : ''}
    ${node.lightData ? renderLightSection(node.lightData) : ''}
    ${node.cameraData ? renderCameraSection(node.cameraData) : ''}

    <div class="inspector-section">
      <div class="section-title">Rendering</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Layers</span>
          <span class="property-value layers-value">${formatLayers(node.layers)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Render Order</span>
          <span class="property-value">${node.renderOrder}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Frustum Culled</span>
          <span class="property-value ${node.frustumCulled ? 'value-true' : 'value-false'}">${node.frustumCulled ? 'Yes' : 'No'}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Children</span>
          <span class="property-value">${node.children.length}</span>
        </div>
      </div>
    </div>
  `;
}

function renderMeshSection(meshData: NonNullable<SceneNode['meshData']>): string {
  const materialCount = meshData.materialRefs.length;
  const materialLabel = materialCount === 1 ? 'Material' : `Materials (${materialCount})`;
  
  return `
    <div class="inspector-section">
      <div class="section-title">Mesh</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Vertices</span>
          <span class="property-value">${formatNumber(meshData.vertexCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Triangles</span>
          <span class="property-value">${formatNumber(meshData.faceCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Geometry</span>
          <span class="property-value uuid">${meshData.geometryRef ? meshData.geometryRef.substring(0, 8) + '...' : '(none)'}</span>
        </div>
        <div class="property-row">
          <span class="property-label">${materialLabel}</span>
          <span class="property-value material-refs">${formatMaterialRefs(meshData.materialRefs)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Cast Shadow</span>
          <span class="property-value ${meshData.castShadow ? 'value-true' : 'value-false'}">${meshData.castShadow ? 'Yes' : 'No'}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Receive Shadow</span>
          <span class="property-value ${meshData.receiveShadow ? 'value-true' : 'value-false'}">${meshData.receiveShadow ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  `;
}

function formatMaterialRefs(refs: string[]): string {
  if (refs.length === 0) return '(none)';
  if (refs.length === 1) {
    return refs[0] ? refs[0].substring(0, 8) + '...' : '(none)';
  }
  // For multiple materials, show count with first UUID
  const first = refs[0] ? refs[0].substring(0, 8) : '???';
  return `${first}... +${refs.length - 1}`;
}

function renderLightSection(lightData: NonNullable<SceneNode['lightData']>): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Light</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Type</span>
          <span class="property-value type-badge">${lightData.lightType}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Color</span>
          <span class="property-value">
            <span class="color-swatch" style="background: #${lightData.color.toString(16).padStart(6, '0')};"></span>
            #${lightData.color.toString(16).padStart(6, '0').toUpperCase()}
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Intensity</span>
          <span class="property-value">${lightData.intensity.toFixed(2)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Cast Shadow</span>
          <span class="property-value ${lightData.castShadow ? 'value-true' : 'value-false'}">${lightData.castShadow ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderCameraSection(cameraData: NonNullable<SceneNode['cameraData']>): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Camera</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Type</span>
          <span class="property-value type-badge">${cameraData.cameraType}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Near</span>
          <span class="property-value">${cameraData.near}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Far</span>
          <span class="property-value">${cameraData.far}</span>
        </div>
        ${cameraData.fov ? `
        <div class="property-row">
          <span class="property-label">FOV</span>
          <span class="property-value">${cameraData.fov}°</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderNoSelectionHint(): string {
  return `
    <div class="no-selection">
      <div class="no-selection-icon">👆</div>
      <div class="no-selection-text">Select an object to inspect</div>
    </div>
  `;
}

function formatVector(v: { x: number; y: number; z: number }): string {
  return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
}

function formatEuler(e: { x: number; y: number; z: number; order: string }): string {
  const toDeg = (r: number) => (r * 180 / Math.PI).toFixed(1);
  return `(${toDeg(e.x)}°, ${toDeg(e.y)}°, ${toDeg(e.z)}°)`;
}

function formatLayers(layerMask: number): string {
  if (layerMask === 0) return 'None';
  if (layerMask === 1) return '0 (default)';
  
  // Find which layers are enabled
  const enabledLayers: number[] = [];
  for (let i = 0; i < 32; i++) {
    if (layerMask & (1 << i)) {
      enabledLayers.push(i);
    }
  }
  
  if (enabledLayers.length === 1) {
    return enabledLayers[0] === 0 ? '0 (default)' : String(enabledLayers[0]);
  }
  
  return enabledLayers.join(', ');
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
    const headerEl = header as HTMLElement;
    const node = headerEl.parentElement;
    const id = node?.dataset.id;

    // Hover highlighting
    headerEl.addEventListener('mouseenter', () => {
      if (id) {
        headerEl.classList.add('hovered');
        port.postMessage({ type: 'hover-object', debugId: id });
      }
    });

    headerEl.addEventListener('mouseleave', () => {
      headerEl.classList.remove('hovered');
      port.postMessage({ type: 'hover-object', debugId: null });
    });

    // Click handling
    headerEl.addEventListener('click', (e) => {
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

