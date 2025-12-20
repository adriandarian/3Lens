/**
 * 3Lens DevTools Panel
 */

import type { DebugMessage, FrameStats, SceneSnapshot, SceneNode, MaterialData } from '@3lens/core';

// ───────────────────────────────────────────────────────────────
// State
// ───────────────────────────────────────────────────────────────

interface PanelState {
  connected: boolean;
  activeTab: 'scene' | 'stats' | 'textures' | 'materials';
  snapshot: SceneSnapshot | null;
  latestStats: FrameStats | null;
  selectedNodeId: string | null;
  selectedMaterialId: string | null;
  expandedNodes: Set<string>;
  frameHistory: number[];
  connectionInfo: {
    appName: string;
    backend: string;
    threeVersion: string;
    probeVersion: string;
  } | null;
}

const state: PanelState = {
  connected: false,
  activeTab: 'scene',
  snapshot: null,
  latestStats: null,
  selectedNodeId: null,
  selectedMaterialId: null,
  expandedNodes: new Set(),
  frameHistory: [],
  connectionInfo: null,
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
      state.connectionInfo = {
        appName: (message as { appName?: string }).appName ?? 'Unknown app',
        backend: (message as { backend?: string }).backend ?? 'webgl',
        threeVersion: (message as { threeVersion?: string }).threeVersion ?? 'unknown',
        probeVersion: (message as { probeVersion?: string }).probeVersion ?? 'unknown',
      };
      updateConnectionStatus(true);
      requestSnapshot();
      break;

    case 'frame-stats':
      state.latestStats = message.stats;
      state.frameHistory.push(message.stats.cpuTimeMs);
      if (state.frameHistory.length > 90) state.frameHistory.shift();
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
  const metaEl = document.getElementById('connection-meta');

  if (dotEl) {
    dotEl.classList.toggle('connected', connected);
    dotEl.classList.toggle('disconnected', !connected);
  }

  if (textEl) {
    textEl.textContent = connected ? 'Connected' : 'Disconnected';
  }

  if (metaEl) {
    if (connected && state.connectionInfo) {
      metaEl.textContent = `${state.connectionInfo.appName} · ${state.connectionInfo.backend.toUpperCase()} · three.js ${state.connectionInfo.threeVersion}`;
      metaEl.classList.remove('hidden');
    } else {
      metaEl.textContent = 'Waiting for three.js...';
      metaEl.classList.add('hidden');
    }
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
    case 'materials':
      renderMaterials();
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
        <p class="hint">Open a three.js app or wait for the injected probe to attach.</p>
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

  const fps = stats.performance?.fps ?? (stats.cpuTimeMs > 0 ? Math.round(1000 / stats.cpuTimeMs) : 0);
  const fps1p = stats.performance?.fps1PercentLow ?? 0;
  const fpsMin = stats.performance?.fpsMin ?? fps;
  const fpsMax = stats.performance?.fpsMax ?? fps;
  const frameBudget = stats.performance?.frameBudgetUsed ?? 0;
  const gpuTime = stats.gpuTimeMs ? `${stats.gpuTimeMs.toFixed(2)}ms` : 'n/a';

  const history = [...state.frameHistory].slice(-90);
  state.frameHistory = history;
  const maxFrame = Math.max(...history, 16.67);

  const memory = stats.memory;
  const rendering = stats.rendering;

  content.innerHTML = `
    <div class="stats-panel">
      ${
        state.connectionInfo
          ? `<div class="stats-connection">
              <div class="stat-connection-name">${state.connectionInfo.appName}</div>
              <div class="stat-connection-meta">${state.connectionInfo.backend.toUpperCase()} · three.js ${state.connectionInfo.threeVersion} · probe ${state.connectionInfo.probeVersion}</div>
            </div>`
          : ''
      }
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">FPS</div>
          <div class="stat-value">${fps}</div>
          <div class="stat-sub">1% low ${fps1p}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Frame Time</div>
          <div class="stat-value">${stats.cpuTimeMs.toFixed(1)}<span class="stat-unit">ms</span></div>
          <div class="stat-sub">GPU ${gpuTime}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Draw Calls</div>
          <div class="stat-value ${stats.drawCalls > 1000 ? 'warning' : ''}">${formatNumber(stats.drawCalls)}</div>
          <div class="stat-sub">${rendering.instancedDrawCalls ?? 0} instanced</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Triangles</div>
          <div class="stat-value ${stats.triangles > 500000 ? 'warning' : ''}">${formatNumber(stats.triangles)}</div>
          <div class="stat-sub">${formatNumber(stats.vertices)} vertices</div>
        </div>
      </div>

      <div class="stats-section">
        <div class="section-title">Frame Stability</div>
        <div class="chart">
          ${history
            .map((value) => {
              const height = Math.min(100, (value / maxFrame) * 100);
              const className = value > stats.performance.targetFrameTimeMs ? 'bar over-budget' : 'bar';
              return `<span class="${className}" style="height:${height}%;" title="${value.toFixed(2)}ms"></span>`;
            })
            .join('')}
        </div>
        <div class="stat-row">
          <span>Frame budget used</span>
          <span class="${frameBudget > 100 ? 'warning' : ''}">${frameBudget.toFixed(1)}%</span>
        </div>
        <div class="stat-row">
          <span>FPS range</span>
          <span>${fpsMin} – ${fpsMax}</span>
        </div>
      </div>

      <div class="stats-section two-column">
        <div>
          <div class="section-title">Memory</div>
          <div class="stat-row">
            <span>GPU memory (est.)</span>
            <span>${formatBytes(memory.totalGpuMemory)}</span>
          </div>
          <div class="stat-row">
            <span>Geometry</span>
            <span>${formatBytes(memory.geometryMemory)} (${memory.geometries} geos)</span>
          </div>
          <div class="stat-row">
            <span>Textures</span>
            <span>${formatBytes(memory.textureMemory)} (${memory.textures} textures)</span>
          </div>
          <div class="stat-row">
            <span>Programs</span>
            <span>${memory.programs}</span>
          </div>
          ${
            memory.jsHeapSize
              ? `<div class="stat-row"><span>JS Heap</span><span>${formatBytes(memory.jsHeapSize)} / ${formatBytes(memory.jsHeapLimit ?? 0)}</span></div>`
              : ''
          }
        </div>
        <div>
          <div class="section-title">Rendering</div>
          <div class="stat-row">
            <span>Visible / Total Objects</span>
            <span>${stats.objectsVisible} / ${stats.objectsTotal}</span>
          </div>
          <div class="stat-row">
            <span>Lights (shadow)</span>
            <span>${rendering.totalLights} (${rendering.shadowCastingLights} casting)</span>
          </div>
          <div class="stat-row">
            <span>Transparent Objects</span>
            <span>${rendering.transparentObjects}</span>
          </div>
          <div class="stat-row">
            <span>Skinned Meshes</span>
            <span>${rendering.skinnedMeshes} (${rendering.totalBones} bones)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ───────────────────────────────────────────────────────────────
// Materials Tab
// ───────────────────────────────────────────────────────────────

function renderMaterials(): void {
  const content = document.getElementById('content');
  if (!content) return;

  const materials = state.snapshot?.materials;
  const summary = state.snapshot?.materialsSummary;

  if (!materials?.length) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎨</div>
        <h2>No Materials</h2>
        <p>No materials found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with materials.</p>
      </div>
    `;
    return;
  }

  // Find selected material
  const selectedMaterial = state.selectedMaterialId
    ? materials.find(m => m.uuid === state.selectedMaterialId)
    : null;

  const html = `
    <div class="materials-split-view">
      <div class="materials-list-panel">
        ${renderMaterialsSummary(summary)}
        <div class="materials-list">
          ${materials.map(mat => renderMaterialListItem(mat)).join('')}
        </div>
      </div>
      <div class="materials-inspector-panel">
        ${selectedMaterial ? renderMaterialInspector(selectedMaterial) : renderNoMaterialSelected()}
      </div>
    </div>
  `;

  content.innerHTML = html;
  attachMaterialEvents();
}

function renderMaterialsSummary(summary: SceneSnapshot['materialsSummary']): string {
  if (!summary) return '';

  return `
    <div class="materials-summary">
      <div class="summary-stat">
        <span class="summary-value">${summary.totalCount}</span>
        <span class="summary-label">Materials</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.shaderMaterialCount}</span>
        <span class="summary-label">Shaders</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.transparentCount}</span>
        <span class="summary-label">Transparent</span>
      </div>
    </div>
  `;
}

function renderMaterialListItem(mat: MaterialData): string {
  const isSelected = state.selectedMaterialId === mat.uuid;
  const colorHex = mat.color !== undefined ? mat.color.toString(16).padStart(6, '0') : null;
  const displayName = mat.name || `<${mat.type}>`;
  const typeIcon = getMaterialTypeIcon(mat.type);
  
  return `
    <div class="material-item ${isSelected ? 'selected' : ''}" data-uuid="${mat.uuid}">
      <div class="material-item-color">
        ${colorHex ? `<span class="color-swatch" style="background: #${colorHex};"></span>` : '<span class="color-swatch no-color">∅</span>'}
      </div>
      <div class="material-item-info">
        <div class="material-item-name">${escapeHtml(displayName)}</div>
        <div class="material-item-type">
          <span class="type-icon">${typeIcon}</span>
          ${mat.type}
        </div>
      </div>
      <div class="material-item-badges">
        ${mat.isShaderMaterial ? '<span class="badge shader">GLSL</span>' : ''}
        ${mat.transparent ? '<span class="badge transparent">α</span>' : ''}
        ${mat.textures.length > 0 ? `<span class="badge textures">${mat.textures.length} tex</span>` : ''}
      </div>
      <div class="material-item-usage">${mat.usageCount}×</div>
    </div>
  `;
}

function renderNoMaterialSelected(): string {
  return `
    <div class="no-selection">
      <div class="no-selection-icon">🎨</div>
      <div class="no-selection-text">Select a material to inspect</div>
    </div>
  `;
}

function renderMaterialInspector(mat: MaterialData): string {
  const colorHex = mat.color !== undefined ? mat.color.toString(16).padStart(6, '0') : null;
  const emissiveHex = mat.emissive !== undefined ? mat.emissive.toString(16).padStart(6, '0') : null;

  return `
    <div class="inspector-header material-header">
      ${colorHex ? `<span class="color-swatch large" style="background: #${colorHex};"></span>` : ''}
      <div class="inspector-header-text">
        <span class="inspector-title">${escapeHtml(mat.name || `<${mat.type}>`)}</span>
        <span class="inspector-subtitle">${mat.type}</span>
      </div>
      <span class="inspector-uuid">${mat.uuid.substring(0, 8)}</span>
    </div>

    <div class="inspector-section">
      <div class="section-title">Properties</div>
      <div class="property-grid">
        ${colorHex !== null ? `
        <div class="property-row">
          <span class="property-label">Color</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="color" value="#${colorHex}" />
            <span class="color-hex">#${colorHex.toUpperCase()}</span>
          </span>
        </div>
        ` : ''}
        ${emissiveHex !== null ? `
        <div class="property-row">
          <span class="property-label">Emissive</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="emissive" value="#${emissiveHex}" />
            <span class="color-hex">#${emissiveHex.toUpperCase()}</span>
          </span>
        </div>
        ` : ''}
        <div class="property-row">
          <span class="property-label">Opacity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="opacity" 
                   min="0" max="1" step="0.01" value="${mat.opacity}" />
            <span class="range-value">${mat.opacity.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Transparent</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="transparent" ${mat.transparent ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Visible</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="visible" ${mat.visible ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Side</span>
          <span class="property-value editable">
            <select class="prop-select-input" data-property="side">
              <option value="0" ${mat.side === 0 ? 'selected' : ''}>Front</option>
              <option value="1" ${mat.side === 1 ? 'selected' : ''}>Back</option>
              <option value="2" ${mat.side === 2 ? 'selected' : ''}>Double</option>
            </select>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Wireframe</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="wireframe" ${mat.wireframe ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Test</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthTest" ${mat.depthTest ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Write</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthWrite" ${mat.depthWrite ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
      </div>
    </div>

    ${mat.pbr ? renderPBRSectionEditable(mat.pbr) : ''}
    ${mat.textures.length > 0 ? renderTexturesSection(mat.textures) : ''}
    ${mat.shader ? renderShaderSection(mat.shader) : ''}

    <div class="inspector-section">
      <div class="section-title">Usage</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Used by</span>
          <span class="property-value">${mat.usageCount} mesh${mat.usageCount !== 1 ? 'es' : ''}</span>
        </div>
      </div>
    </div>
  `;
}

function renderPBRSection(pbr: NonNullable<MaterialData['pbr']>): string {
  return `
    <div class="inspector-section">
      <div class="section-title">PBR Properties</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Roughness</span>
          <span class="property-value">
            <span class="pbr-bar"><span class="pbr-fill" style="width: ${pbr.roughness * 100}%"></span></span>
            ${pbr.roughness.toFixed(2)}
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Metalness</span>
          <span class="property-value">
            <span class="pbr-bar"><span class="pbr-fill metalness" style="width: ${pbr.metalness * 100}%"></span></span>
            ${pbr.metalness.toFixed(2)}
          </span>
        </div>
        ${pbr.reflectivity !== undefined ? `
        <div class="property-row">
          <span class="property-label">Reflectivity</span>
          <span class="property-value">${pbr.reflectivity.toFixed(2)}</span>
        </div>
        ` : ''}
        ${pbr.clearcoat !== undefined && pbr.clearcoat > 0 ? `
        <div class="property-row">
          <span class="property-label">Clearcoat</span>
          <span class="property-value">${pbr.clearcoat.toFixed(2)}</span>
        </div>
        ` : ''}
        ${pbr.transmission !== undefined && pbr.transmission > 0 ? `
        <div class="property-row">
          <span class="property-label">Transmission</span>
          <span class="property-value">${pbr.transmission.toFixed(2)}</span>
        </div>
        ` : ''}
        ${pbr.ior !== undefined ? `
        <div class="property-row">
          <span class="property-label">IOR</span>
          <span class="property-value">${pbr.ior.toFixed(2)}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderPBRSectionEditable(pbr: NonNullable<MaterialData['pbr']>): string {
  return `
    <div class="inspector-section">
      <div class="section-title">PBR Properties</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Roughness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider" data-property="roughness" 
                   min="0" max="1" step="0.01" value="${pbr.roughness}" />
            <span class="range-value">${pbr.roughness.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Metalness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider metalness" data-property="metalness" 
                   min="0" max="1" step="0.01" value="${pbr.metalness}" />
            <span class="range-value">${pbr.metalness.toFixed(2)}</span>
          </span>
        </div>
        ${pbr.reflectivity !== undefined ? `
        <div class="property-row">
          <span class="property-label">Reflectivity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="reflectivity" 
                   min="0" max="1" step="0.01" value="${pbr.reflectivity}" />
            <span class="range-value">${pbr.reflectivity.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
        ${pbr.clearcoat !== undefined ? `
        <div class="property-row">
          <span class="property-label">Clearcoat</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="clearcoat" 
                   min="0" max="1" step="0.01" value="${pbr.clearcoat}" />
            <span class="range-value">${pbr.clearcoat.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
        ${pbr.clearcoatRoughness !== undefined ? `
        <div class="property-row">
          <span class="property-label">Clearcoat Rough</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="clearcoatRoughness" 
                   min="0" max="1" step="0.01" value="${pbr.clearcoatRoughness}" />
            <span class="range-value">${pbr.clearcoatRoughness.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
        ${pbr.transmission !== undefined ? `
        <div class="property-row">
          <span class="property-label">Transmission</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="transmission" 
                   min="0" max="1" step="0.01" value="${pbr.transmission}" />
            <span class="range-value">${pbr.transmission.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
        ${pbr.ior !== undefined ? `
        <div class="property-row">
          <span class="property-label">IOR</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="ior" 
                   min="1" max="2.5" step="0.01" value="${pbr.ior}" />
            <span class="range-value">${pbr.ior.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderTexturesSection(textures: MaterialData['textures']): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Textures (${textures.length})</div>
      <div class="texture-list">
        ${textures.map(tex => `
          <div class="texture-item">
            <span class="texture-slot">${tex.slot}</span>
            <span class="texture-uuid">${tex.uuid.substring(0, 8)}...</span>
            ${tex.name ? `<span class="texture-name">${escapeHtml(tex.name)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderShaderSection(shader: NonNullable<MaterialData['shader']>): string {
  const hasDefines = Object.keys(shader.defines).length > 0;
  
  return `
    <div class="inspector-section shader-section">
      <div class="section-title">Shader</div>
      
      ${shader.uniforms.length > 0 ? `
      <div class="shader-subsection">
        <div class="subsection-title">Uniforms (${shader.uniforms.length})</div>
        <div class="uniforms-list">
          ${shader.uniforms.map(u => `
            <div class="uniform-item">
              <span class="uniform-type">${u.type}</span>
              <span class="uniform-name">${u.name}</span>
              <span class="uniform-value">${formatUniformValue(u)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${hasDefines ? `
      <div class="shader-subsection">
        <div class="subsection-title">Defines</div>
        <div class="defines-list">
          ${Object.entries(shader.defines).map(([key, value]) => `
            <div class="define-item">
              <span class="define-name">${key}</span>
              <span class="define-value">${String(value)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="shader-subsection">
        <div class="subsection-title">Vertex Shader</div>
        <pre class="shader-code"><code>${highlightGLSL(truncateShader(shader.vertexShader))}</code></pre>
      </div>

      <div class="shader-subsection">
        <div class="subsection-title">Fragment Shader</div>
        <pre class="shader-code"><code>${highlightGLSL(truncateShader(shader.fragmentShader))}</code></pre>
      </div>
    </div>
  `;
}

function formatUniformValue(uniform: MaterialData['shader'] extends { uniforms: infer U } ? U extends Array<infer T> ? T : never : never): string {
  const val = uniform.value;
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'number') return val.toFixed(4);
  if (typeof val === 'object') {
    if ('x' in val && 'y' in val && 'z' in val && 'w' in val) {
      return `(${(val as {x:number,y:number,z:number,w:number}).x.toFixed(2)}, ${(val as {x:number,y:number,z:number,w:number}).y.toFixed(2)}, ${(val as {x:number,y:number,z:number,w:number}).z.toFixed(2)}, ${(val as {x:number,y:number,z:number,w:number}).w.toFixed(2)})`;
    }
    if ('x' in val && 'y' in val && 'z' in val) {
      return `(${(val as {x:number,y:number,z:number}).x.toFixed(2)}, ${(val as {x:number,y:number,z:number}).y.toFixed(2)}, ${(val as {x:number,y:number,z:number}).z.toFixed(2)})`;
    }
    if ('r' in val && 'g' in val && 'b' in val) {
      return `rgb(${(val as {r:number,g:number,b:number}).r.toFixed(2)}, ${(val as {r:number,g:number,b:number}).g.toFixed(2)}, ${(val as {r:number,g:number,b:number}).b.toFixed(2)})`;
    }
    if ('x' in val && 'y' in val) {
      return `(${(val as {x:number,y:number}).x.toFixed(2)}, ${(val as {x:number,y:number}).y.toFixed(2)})`;
    }
    if ('uuid' in val) {
      return `texture:${(val as {uuid:string}).uuid.substring(0, 8)}`;
    }
    if (Array.isArray(val)) {
      return `[${val.length}]`;
    }
  }
  return String(val);
}

function truncateShader(source: string, maxLines = 20): string {
  const lines = source.split('\n');
  if (lines.length <= maxLines) return source;
  return lines.slice(0, maxLines).join('\n') + `\n\n// ... ${lines.length - maxLines} more lines`;
}

// ───────────────────────────────────────────────────────────────
// GLSL Syntax Highlighting
// ───────────────────────────────────────────────────────────────

const GLSL_KEYWORDS = new Set([
  // Storage qualifiers
  'const', 'uniform', 'attribute', 'varying', 'in', 'out', 'inout',
  'centroid', 'flat', 'smooth', 'noperspective', 'layout', 'patch',
  'sample', 'buffer', 'shared', 'coherent', 'volatile', 'restrict',
  'readonly', 'writeonly', 'precision', 'highp', 'mediump', 'lowp',
  // Control flow
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'return', 'discard',
  // Types
  'void', 'bool', 'int', 'uint', 'float', 'double',
  'vec2', 'vec3', 'vec4', 'dvec2', 'dvec3', 'dvec4',
  'bvec2', 'bvec3', 'bvec4', 'ivec2', 'ivec3', 'ivec4', 'uvec2', 'uvec3', 'uvec4',
  'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4',
  'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4',
  'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube',
  'sampler1DShadow', 'sampler2DShadow', 'samplerCubeShadow',
  'sampler1DArray', 'sampler2DArray', 'sampler1DArrayShadow', 'sampler2DArrayShadow',
  'isampler1D', 'isampler2D', 'isampler3D', 'isamplerCube',
  'usampler1D', 'usampler2D', 'usampler3D', 'usamplerCube',
  'struct', 'true', 'false',
]);

const GLSL_BUILTINS = new Set([
  // Math functions
  'radians', 'degrees', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  'pow', 'exp', 'log', 'exp2', 'log2', 'sqrt', 'inversesqrt',
  'abs', 'sign', 'floor', 'trunc', 'round', 'roundEven', 'ceil', 'fract',
  'mod', 'modf', 'min', 'max', 'clamp', 'mix', 'step', 'smoothstep',
  'isnan', 'isinf', 'floatBitsToInt', 'floatBitsToUint', 'intBitsToFloat', 'uintBitsToFloat',
  // Geometric functions
  'length', 'distance', 'dot', 'cross', 'normalize', 'faceforward',
  'reflect', 'refract',
  // Matrix functions
  'matrixCompMult', 'outerProduct', 'transpose', 'determinant', 'inverse',
  // Vector relational
  'lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual',
  'equal', 'notEqual', 'any', 'all', 'not',
  // Texture functions
  'texture', 'textureProj', 'textureLod', 'textureOffset', 'texelFetch',
  'textureGrad', 'textureGather', 'textureSize', 'textureProjLod',
  'texture2D', 'texture2DProj', 'texture2DLod', 'textureCube', 'textureCubeLod',
  // Fragment processing
  'dFdx', 'dFdy', 'fwidth',
  // Noise (deprecated but common)
  'noise1', 'noise2', 'noise3', 'noise4',
  // Other
  'main',
]);

function highlightGLSL(source: string): string {
  // Tokenize and highlight the GLSL code
  let result = '';
  let i = 0;
  const len = source.length;

  while (i < len) {
    // Multi-line comment
    if (source[i] === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const commentEnd = end === -1 ? len : end + 2;
      result += `<span class="glsl-comment">${escapeHtml(source.slice(i, commentEnd))}</span>`;
      i = commentEnd;
      continue;
    }

    // Single-line comment
    if (source[i] === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      const commentEnd = end === -1 ? len : end;
      result += `<span class="glsl-comment">${escapeHtml(source.slice(i, commentEnd))}</span>`;
      i = commentEnd;
      continue;
    }

    // Preprocessor directive
    if (source[i] === '#') {
      const end = source.indexOf('\n', i);
      const directiveEnd = end === -1 ? len : end;
      result += `<span class="glsl-preprocessor">${escapeHtml(source.slice(i, directiveEnd))}</span>`;
      i = directiveEnd;
      continue;
    }

    // String (rare in GLSL but possible in some contexts)
    if (source[i] === '"') {
      let j = i + 1;
      while (j < len && source[j] !== '"' && source[j] !== '\n') {
        if (source[j] === '\\') j++;
        j++;
      }
      if (source[j] === '"') j++;
      result += `<span class="glsl-string">${escapeHtml(source.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // Number (int, float, hex)
    if (/[0-9]/.test(source[i]) || (source[i] === '.' && /[0-9]/.test(source[i + 1]))) {
      let j = i;
      // Hex number
      if (source[j] === '0' && (source[j + 1] === 'x' || source[j + 1] === 'X')) {
        j += 2;
        while (j < len && /[0-9a-fA-F]/.test(source[j])) j++;
      } else {
        // Decimal/float
        while (j < len && /[0-9]/.test(source[j])) j++;
        if (source[j] === '.' && /[0-9]/.test(source[j + 1])) {
          j++;
          while (j < len && /[0-9]/.test(source[j])) j++;
        }
        // Exponent
        if (source[j] === 'e' || source[j] === 'E') {
          j++;
          if (source[j] === '+' || source[j] === '-') j++;
          while (j < len && /[0-9]/.test(source[j])) j++;
        }
      }
      // Type suffix (u, f, lf)
      if (source[j] === 'u' || source[j] === 'U' || source[j] === 'f' || source[j] === 'F') {
        j++;
      } else if ((source[j] === 'l' || source[j] === 'L') && (source[j + 1] === 'f' || source[j + 1] === 'F')) {
        j += 2;
      }
      result += `<span class="glsl-number">${escapeHtml(source.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(source[i])) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_]/.test(source[j])) j++;
      const word = source.slice(i, j);
      
      if (GLSL_KEYWORDS.has(word)) {
        result += `<span class="glsl-keyword">${word}</span>`;
      } else if (GLSL_BUILTINS.has(word)) {
        result += `<span class="glsl-builtin">${word}</span>`;
      } else if (word.startsWith('gl_')) {
        result += `<span class="glsl-builtin-var">${word}</span>`;
      } else {
        result += `<span class="glsl-ident">${word}</span>`;
      }
      i = j;
      continue;
    }

    // Operators and punctuation
    if ('+-*/%=<>!&|^~?:;,.()[]{}#'.includes(source[i])) {
      result += `<span class="glsl-punct">${escapeHtml(source[i])}</span>`;
      i++;
      continue;
    }

    // Whitespace and other characters
    result += escapeHtml(source[i]);
    i++;
  }

  return result;
}

function getMaterialTypeIcon(type: string): string {
  if (type.includes('Physical')) return '◆';
  if (type.includes('Standard')) return '◇';
  if (type.includes('Basic')) return '○';
  if (type.includes('Lambert')) return '◐';
  if (type.includes('Phong')) return '◑';
  if (type.includes('Toon')) return '◕';
  if (type.includes('Shader') || type.includes('Raw')) return '⬡';
  if (type.includes('Sprite')) return '◎';
  if (type.includes('Points')) return '•';
  if (type.includes('Line')) return '―';
  return '●';
}

function getSideName(side: number): string {
  switch (side) {
    case 0: return 'Front';
    case 1: return 'Back';
    case 2: return 'Double';
    default: return `Unknown (${side})`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function attachMaterialEvents(): void {
  // Material list item selection
  document.querySelectorAll('.material-item').forEach((item) => {
    const itemEl = item as HTMLElement;
    const uuid = itemEl.dataset.uuid;

    itemEl.addEventListener('click', () => {
      if (!uuid) return;
      state.selectedMaterialId = uuid;
      renderMaterials();
    });
  });

  // Editable property controls
  const materialUuid = state.selectedMaterialId;
  if (!materialUuid) return;

  // Color pickers
  document.querySelectorAll<HTMLInputElement>('.prop-color-input').forEach((input) => {
    input.addEventListener('input', () => {
      const property = input.dataset.property;
      if (!property) return;
      // Convert hex string to number
      const hexValue = parseInt(input.value.replace('#', ''), 16);
      sendMaterialPropertyUpdate(materialUuid, property, hexValue);
    });
  });

  // Range sliders
  document.querySelectorAll<HTMLInputElement>('.prop-range-input').forEach((input) => {
    input.addEventListener('input', () => {
      const property = input.dataset.property;
      if (!property) return;
      const value = parseFloat(input.value);
      // Update the displayed value
      const valueDisplay = input.parentElement?.querySelector('.range-value');
      if (valueDisplay) {
        valueDisplay.textContent = value.toFixed(2);
      }
      sendMaterialPropertyUpdate(materialUuid, property, value);
    });
  });

  // Checkboxes
  document.querySelectorAll<HTMLInputElement>('.prop-checkbox-input').forEach((input) => {
    input.addEventListener('change', () => {
      const property = input.dataset.property;
      if (!property) return;
      sendMaterialPropertyUpdate(materialUuid, property, input.checked);
    });
  });

  // Select dropdowns
  document.querySelectorAll<HTMLSelectElement>('.prop-select-input').forEach((select) => {
    select.addEventListener('change', () => {
      const property = select.dataset.property;
      if (!property) return;
      const value = parseInt(select.value, 10);
      sendMaterialPropertyUpdate(materialUuid, property, value);
    });
  });
}

function sendMaterialPropertyUpdate(materialUuid: string, property: string, value: unknown): void {
  port.postMessage({
    type: 'update-material-property',
    materialUuid,
    property,
    value,
  });
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

function formatBytes(bytes: number): string {
  if (bytes <= 0 || Number.isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Initial render
renderContent();
