/**
 * 3Lens DevTools Panel
 */

import type { DebugMessage, FrameStats, SceneSnapshot, SceneNode, MaterialData, GeometryData, TextureData, RenderTargetData } from '@3lens/core';

// ───────────────────────────────────────────────────────────────
// State
// ───────────────────────────────────────────────────────────────

interface PanelState {
  connected: boolean;
  activeTab: 'scene' | 'stats' | 'textures' | 'materials' | 'geometry' | 'render-targets';
  snapshot: SceneSnapshot | null;
  latestStats: FrameStats | null;
  selectedNodeId: string | null;
  selectedMaterialId: string | null;
  selectedGeometryId: string | null;
  selectedTextureId: string | null;
  selectedRenderTargetId: string | null;
  expandedNodes: Set<string>;
  frameHistory: number[];
  connectionInfo: {
    appName: string;
    backend: string;
    threeVersion: string;
    probeVersion: string;
  } | null;
  geometryVisualization: {
    wireframe: Set<string>;
    boundingBox: Set<string>;
    normals: Set<string>;
  };
  texturePreviewChannel: 'rgb' | 'r' | 'g' | 'b' | 'a';
  renderTargetPreviewMode: 'color' | 'depth' | 'r' | 'g' | 'b' | 'a' | 'heatmap';
  renderTargetZoom: number;
}

const state: PanelState = {
  connected: false,
  activeTab: 'scene',
  snapshot: null,
  latestStats: null,
  selectedNodeId: null,
  selectedMaterialId: null,
  selectedGeometryId: null,
  selectedTextureId: null,
  selectedRenderTargetId: null,
  expandedNodes: new Set(),
  frameHistory: [],
  connectionInfo: null,
  geometryVisualization: {
    wireframe: new Set(),
    boundingBox: new Set(),
    normals: new Set(),
  },
  texturePreviewChannel: 'rgb',
  renderTargetPreviewMode: 'color',
  renderTargetZoom: 1,
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
    case 'geometry':
      renderGeometry();
      break;
    case 'textures':
      renderTextures();
      break;
    case 'render-targets':
      renderRenderTargets();
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
  const isVisible = node.visible;
  const iconClass = getIconClass(node.ref.type);

  return `
    <div class="tree-node" data-id="${node.ref.debugId}">
      <div class="node-header ${isSelected ? 'selected' : ''} ${!isVisible ? 'hidden-object' : ''}">
        <span class="node-toggle ${hasChildren ? (isExpanded ? 'expanded' : '') : ''}" style="${hasChildren ? '' : 'visibility:hidden'}">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <path d="M2 1L6 4L2 7z"/>
          </svg>
        </span>
        <span class="node-icon ${iconClass}">${getIcon(node.ref.type)}</span>
        <span class="node-name">${node.ref.name || `<${node.ref.type}>`}</span>
        <button class="node-visibility-btn ${isVisible ? 'visible' : 'hidden'}" data-id="${node.ref.debugId}" title="${isVisible ? 'Hide object' : 'Show object'}">
          ${isVisible ? getEyeOpenIcon() : getEyeClosedIcon()}
        </button>
        <span class="node-spacer"></span>
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

function getEyeOpenIcon(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`;
}

function getEyeClosedIcon(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`;
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

// ───────────────────────────────────────────────────────────────
// Geometry Tab
// ───────────────────────────────────────────────────────────────

function renderGeometry(): void {
  const content = document.getElementById('content');
  if (!content) return;

  const geometries = state.snapshot?.geometries;
  const summary = state.snapshot?.geometriesSummary;

  if (!geometries?.length) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📐</div>
        <h2>No Geometries</h2>
        <p>No geometries found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with geometries.</p>
      </div>
    `;
    return;
  }

  // Find selected geometry
  const selectedGeometry = state.selectedGeometryId
    ? geometries.find(g => g.uuid === state.selectedGeometryId)
    : null;

  const html = `
    <div class="geometry-split-view">
      <div class="geometry-list-panel">
        ${renderGeometrySummary(summary)}
        <div class="geometry-list">
          ${geometries.map(geo => renderGeometryListItem(geo)).join('')}
        </div>
      </div>
      <div class="geometry-inspector-panel">
        ${selectedGeometry ? renderGeometryInspector(selectedGeometry) : renderNoGeometrySelected()}
      </div>
    </div>
  `;

  content.innerHTML = html;
  attachGeometryEvents();
}

function renderGeometrySummary(summary: SceneSnapshot['geometriesSummary']): string {
  if (!summary) return '';

  return `
    <div class="geometry-summary">
      <div class="summary-stat">
        <span class="summary-value">${summary.totalCount}</span>
        <span class="summary-label">Geometries</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${formatNumber(summary.totalVertices)}</span>
        <span class="summary-label">Vertices</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${formatNumber(summary.totalTriangles)}</span>
        <span class="summary-label">Triangles</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${formatBytes(summary.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.indexedCount}</span>
        <span class="summary-label">Indexed</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.morphedCount}</span>
        <span class="summary-label">Morphed</span>
      </div>
    </div>
  `;
}

function renderGeometryListItem(geo: GeometryData): string {
  const isSelected = state.selectedGeometryId === geo.uuid;
  const displayName = geo.name || `<${geo.type}>`;
  const geoIcon = getGeometryIcon(geo.type);

  return `
    <div class="geometry-item ${isSelected ? 'selected' : ''}" data-uuid="${geo.uuid}">
      <div class="geometry-item-icon">${geoIcon}</div>
      <div class="geometry-item-info">
        <div class="geometry-item-name-row">
          <div class="geometry-item-name">${escapeHtml(displayName)}</div>
          <div class="geometry-item-stats">
            <span class="geo-stat-pill vertices">${formatNumber(geo.vertexCount)} v</span>
            <span class="geo-stat-pill triangles">${formatNumber(geo.faceCount)} △</span>
            <span class="geo-stat-pill memory">${formatBytes(geo.memoryBytes)}</span>
            <span class="geo-stat-pill usage">${geo.usageCount}×</span>
          </div>
        </div>
        <div class="geometry-item-meta">
          <span>${geo.type}</span>
          <span>${geo.attributes.length} attrs</span>
          ${geo.isIndexed ? '<span>indexed</span>' : ''}
        </div>
      </div>
    </div>
  `;
}

function renderNoGeometrySelected(): string {
  return `
    <div class="no-selection">
      <div class="no-selection-icon">📐</div>
      <div class="no-selection-text">Select a geometry to inspect</div>
    </div>
  `;
}

function renderGeometryInspector(geo: GeometryData): string {
  const geoIcon = getGeometryIcon(geo.type);

  return `
    <div class="inspector-header geometry-header">
      <div class="geometry-item-icon">${geoIcon}</div>
      <div class="inspector-header-text">
        <span class="inspector-title">${escapeHtml(geo.name || `<${geo.type}>`)}</span>
        <span class="inspector-subtitle">${geo.type}</span>
      </div>
      <span class="inspector-uuid">${geo.uuid.substring(0, 8)}</span>
    </div>

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Vertices</span>
          <span class="property-value">${formatNumber(geo.vertexCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Triangles</span>
          <span class="property-value">${formatNumber(geo.faceCount)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Indices</span>
          <span class="property-value">${geo.isIndexed ? formatNumber(geo.indexCount) : 'Non-indexed'}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value">${formatBytes(geo.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Used by</span>
          <span class="property-value">${geo.usageCount} mesh${geo.usageCount !== 1 ? 'es' : ''}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Draw Range</span>
          <span class="property-value">${geo.drawRange.start} → ${geo.drawRange.count === Infinity ? '∞' : geo.drawRange.count}</span>
        </div>
      </div>
    </div>

    ${renderAttributesSection(geo.attributes)}
    ${geo.boundingBox ? renderBoundingBoxSection(geo.boundingBox) : ''}
    ${geo.boundingSphere ? renderBoundingSphereSection(geo.boundingSphere) : ''}
    ${geo.groups.length > 0 ? renderGroupsSection(geo.groups) : ''}
    ${geo.morphAttributes && geo.morphAttributes.length > 0 ? renderMorphAttributesSection(geo.morphAttributes) : ''}

    <div class="inspector-actions">
      <button class="action-btn ${state.geometryVisualization.boundingBox.has(geo.uuid) ? 'active' : ''}" data-action="toggle-bbox" data-uuid="${geo.uuid}">
        <span class="btn-icon">📦</span>
        Bounds
      </button>
      <button class="action-btn ${state.geometryVisualization.wireframe.has(geo.uuid) ? 'active' : ''}" data-action="toggle-wireframe" data-uuid="${geo.uuid}">
        <span class="btn-icon">🔲</span>
        Wireframe
      </button>
      <button class="action-btn ${state.geometryVisualization.normals.has(geo.uuid) ? 'active' : ''}" data-action="toggle-normals" data-uuid="${geo.uuid}">
        <span class="btn-icon">↗️</span>
        Normals
      </button>
    </div>
  `;
}

function renderAttributesSection(attributes: GeometryData['attributes']): string {
  if (attributes.length === 0) return '';

  return `
    <div class="inspector-section">
      <div class="section-title">Attributes (${attributes.length})</div>
      <table class="attributes-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Type</th>
            <th>Memory</th>
          </tr>
        </thead>
        <tbody>
          ${attributes.map(attr => `
            <tr>
              <td>
                <span class="attr-name">${attr.name}</span>
                ${attr.isInstancedAttribute ? '<span class="badge transparent">instanced</span>' : ''}
              </td>
              <td class="attr-count">${formatNumber(attr.count)} × ${attr.itemSize}</td>
              <td class="attr-type">${getShortTypeName(attr.arrayType)}${attr.normalized ? ' (N)' : ''}</td>
              <td class="attr-size">${formatBytes(attr.memoryBytes)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderBoundingBoxSection(bbox: NonNullable<GeometryData['boundingBox']>): string {
  const width = Math.abs(bbox.max.x - bbox.min.x);
  const height = Math.abs(bbox.max.y - bbox.min.y);
  const depth = Math.abs(bbox.max.z - bbox.min.z);

  return `
    <div class="inspector-section">
      <div class="section-title">Bounding Box</div>
      <div class="bounding-box-viz">
        <div class="coord-row">
          <span class="coord-label">Min</span>
          <span class="coord-values">(${bbox.min.x.toFixed(2)}, ${bbox.min.y.toFixed(2)}, ${bbox.min.z.toFixed(2)})</span>
        </div>
        <div class="coord-row">
          <span class="coord-label">Max</span>
          <span class="coord-values">(${bbox.max.x.toFixed(2)}, ${bbox.max.y.toFixed(2)}, ${bbox.max.z.toFixed(2)})</span>
        </div>
        <div class="box-dimensions">
          Dimensions: <span class="dim-value">${width.toFixed(2)}</span> × <span class="dim-value">${height.toFixed(2)}</span> × <span class="dim-value">${depth.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderBoundingSphereSection(sphere: NonNullable<GeometryData['boundingSphere']>): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Bounding Sphere</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Center</span>
          <span class="property-value vector">(${sphere.center.x.toFixed(2)}, ${sphere.center.y.toFixed(2)}, ${sphere.center.z.toFixed(2)})</span>
        </div>
        <div class="property-row">
          <span class="property-label">Radius</span>
          <span class="property-value">${sphere.radius.toFixed(3)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderGroupsSection(groups: GeometryData['groups']): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Groups (${groups.length})</div>
      <div class="groups-list">
        ${groups.map((group, i) => `
          <div class="group-item">
            <span class="group-index">#${i}</span>
            <span class="group-range">${group.start} → ${group.start + group.count}</span>
            <span class="group-material">Mat[${group.materialIndex}]</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderMorphAttributesSection(morphs: NonNullable<GeometryData['morphAttributes']>): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Morph Targets</div>
      <div class="morph-list">
        ${morphs.map(morph => `
          <div class="morph-item">
            <span class="morph-name">${morph.name}</span>
            <span class="morph-count">×${morph.count}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getGeometryIcon(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('box') || lower.includes('cube')) return '📦';
  if (lower.includes('sphere')) return '🔮';
  if (lower.includes('plane')) return '⬛';
  if (lower.includes('cylinder')) return '🧴';
  if (lower.includes('cone')) return '🔺';
  if (lower.includes('torus')) return '🍩';
  if (lower.includes('ring')) return '💍';
  if (lower.includes('circle')) return '⭕';
  if (lower.includes('tube')) return '🧪';
  if (lower.includes('extrude')) return '📊';
  if (lower.includes('lathe')) return '🏺';
  if (lower.includes('text') || lower.includes('shape')) return '✒️';
  if (lower.includes('instanced')) return '🔄';
  return '📐';
}

function getShortTypeName(arrayType: string): string {
  const map: Record<string, string> = {
    'Float32Array': 'f32',
    'Float64Array': 'f64',
    'Int8Array': 'i8',
    'Int16Array': 'i16',
    'Int32Array': 'i32',
    'Uint8Array': 'u8',
    'Uint16Array': 'u16',
    'Uint32Array': 'u32',
    'Uint8ClampedArray': 'u8c',
  };
  return map[arrayType] || arrayType;
}

function attachGeometryEvents(): void {
  // Geometry list item selection
  document.querySelectorAll('.geometry-item').forEach((item) => {
    const itemEl = item as HTMLElement;
    const uuid = itemEl.dataset.uuid;

    itemEl.addEventListener('click', () => {
      if (!uuid) return;
      state.selectedGeometryId = uuid;
      renderGeometry();
    });
  });

  // Action buttons - scope to geometry inspector panel only
  const inspectorPanel = document.querySelector('.geometry-inspector-panel');
  if (inspectorPanel) {
    inspectorPanel.querySelectorAll('.action-btn').forEach((btn) => {
      const btnEl = btn as HTMLElement;
      const action = btnEl.dataset.action;
      const uuid = btnEl.dataset.uuid;

      if (!action || !uuid) return;

      btnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleGeometryAction(action, uuid);
      });
    });
  }
}

function handleGeometryAction(action: string, geometryUuid: string): void {
  switch (action) {
    case 'toggle-bbox': {
      const set = state.geometryVisualization.boundingBox;
      if (set.has(geometryUuid)) {
        set.delete(geometryUuid);
      } else {
        set.add(geometryUuid);
      }
      port.postMessage({
        type: 'geometry-visualization',
        geometryUuid,
        visualization: 'boundingBox',
        enabled: set.has(geometryUuid),
      });
      renderGeometry();
      break;
    }
    case 'toggle-wireframe': {
      const set = state.geometryVisualization.wireframe;
      if (set.has(geometryUuid)) {
        set.delete(geometryUuid);
      } else {
        set.add(geometryUuid);
      }
      port.postMessage({
        type: 'geometry-visualization',
        geometryUuid,
        visualization: 'wireframe',
        enabled: set.has(geometryUuid),
      });
      renderGeometry();
      break;
    }
    case 'toggle-normals': {
      const set = state.geometryVisualization.normals;
      if (set.has(geometryUuid)) {
        set.delete(geometryUuid);
      } else {
        set.add(geometryUuid);
      }
      port.postMessage({
        type: 'geometry-visualization',
        geometryUuid,
        visualization: 'normals',
        enabled: set.has(geometryUuid),
      });
      renderGeometry();
      break;
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Textures Tab
// ───────────────────────────────────────────────────────────────

function renderTextures(): void {
  const content = document.getElementById('content');
  if (!content) return;

  const textures = state.snapshot?.textures;
  const summary = state.snapshot?.texturesSummary;

  if (!textures?.length) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🖼️</div>
        <h2>No Textures</h2>
        <p>No textures found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain materials with textures.</p>
      </div>
    `;
    return;
  }

  // Find selected texture
  const selectedTexture = state.selectedTextureId
    ? textures.find(t => t.uuid === state.selectedTextureId)
    : null;

  const html = `
    <div class="textures-split-view">
      <div class="textures-list-panel">
        ${renderTexturesSummary(summary)}
        <div class="textures-list">
          ${textures.map(tex => renderTextureListItem(tex)).join('')}
        </div>
      </div>
      <div class="textures-inspector-panel">
        ${selectedTexture ? renderTextureInspector(selectedTexture) : renderNoTextureSelected()}
      </div>
    </div>
  `;

  content.innerHTML = html;
  attachTextureEvents();
}

function renderTexturesSummary(summary: SceneSnapshot['texturesSummary']): string {
  if (!summary) return '';

  return `
    <div class="textures-summary">
      <div class="summary-stat">
        <span class="summary-value">${summary.totalCount}</span>
        <span class="summary-label">Textures</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${formatBytes(summary.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.cubeTextureCount}</span>
        <span class="summary-label">Cube Maps</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.compressedCount}</span>
        <span class="summary-label">Compressed</span>
      </div>
    </div>
  `;
}

function renderTextureListItem(tex: TextureData): string {
  const isSelected = state.selectedTextureId === tex.uuid;
  const displayName = tex.name || `<${tex.type}>`;
  const texIcon = getTextureIcon(tex);
  const dimensionText = tex.dimensions.width > 0 
    ? `${tex.dimensions.width}×${tex.dimensions.height}` 
    : 'Unknown';

  return `
    <div class="texture-item ${isSelected ? 'selected' : ''}" data-uuid="${tex.uuid}">
      <div class="texture-item-thumbnail">
        ${tex.thumbnail 
          ? `<img src="${tex.thumbnail}" alt="${escapeHtml(displayName)}" class="texture-thumb-img" />`
          : `<div class="texture-thumb-placeholder">${texIcon}</div>`
        }
      </div>
      <div class="texture-item-info">
        <div class="texture-item-name">${escapeHtml(displayName)}</div>
        <div class="texture-item-meta">
          <span>${tex.type}</span>
          <span>${dimensionText}</span>
        </div>
      </div>
      <div class="texture-item-badges">
        ${tex.isCubeTexture ? '<span class="badge cube">Cube</span>' : ''}
        ${tex.isCompressed ? '<span class="badge compressed">DXT</span>' : ''}
        ${tex.isVideoTexture ? '<span class="badge video">Video</span>' : ''}
        ${tex.isRenderTarget ? '<span class="badge rt">RT</span>' : ''}
        ${tex.mipmaps.enabled ? '<span class="badge mip">MIP</span>' : ''}
      </div>
      <div class="texture-item-stats">
        <span class="tex-stat-pill memory">${formatBytes(tex.memoryBytes)}</span>
      </div>
      <div class="texture-item-usage">${tex.usageCount}×</div>
    </div>
  `;
}

function renderNoTextureSelected(): string {
  return `
    <div class="no-selection">
      <div class="no-selection-icon">🖼️</div>
      <div class="no-selection-text">Select a texture to inspect</div>
    </div>
  `;
}

function renderTextureInspector(tex: TextureData): string {
  const texIcon = getTextureIcon(tex);
  const dimensionText = tex.dimensions.width > 0 
    ? `${tex.dimensions.width} × ${tex.dimensions.height}` 
    : 'Unknown';

  return `
    <div class="inspector-header texture-header">
      <div class="texture-header-thumb">
        ${tex.thumbnail 
          ? `<img src="${tex.thumbnail}" alt="Preview" class="texture-header-img" />`
          : `<div class="texture-header-placeholder">${texIcon}</div>`
        }
      </div>
      <div class="inspector-header-text">
        <span class="inspector-title">${escapeHtml(tex.name || `<${tex.type}>`)}</span>
        <span class="inspector-subtitle">${tex.type}</span>
      </div>
      <span class="inspector-uuid">${tex.uuid.substring(0, 8)}</span>
    </div>

    ${tex.thumbnail ? renderTexturePreview(tex) : ''}

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Dimensions</span>
          <span class="property-value">${dimensionText}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Format</span>
          <span class="property-value type-badge">${tex.formatName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Data Type</span>
          <span class="property-value">${tex.dataTypeName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value memory-value">${formatBytes(tex.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Color Space</span>
          <span class="property-value">${tex.colorSpace}</span>
        </div>
      </div>
    </div>

    ${renderTextureSource(tex)}
    ${renderTextureMipmaps(tex)}
    ${renderTextureFiltering(tex)}
    ${renderTextureWrapping(tex)}
    ${renderTextureFlags(tex)}
    ${renderTextureUsage(tex)}
  `;
}

function renderTexturePreview(tex: TextureData): string {
  if (!tex.thumbnail) return '';

  return `
    <div class="inspector-section texture-preview-section">
      <div class="section-title">Preview</div>
      <div class="texture-preview-container">
        <img src="${tex.thumbnail}" alt="Texture Preview" class="texture-preview-img channel-${state.texturePreviewChannel}" />
        <div class="texture-channel-toggles">
          <button class="channel-btn ${state.texturePreviewChannel === 'rgb' ? 'active' : ''}" data-channel="rgb" title="RGB">RGB</button>
          <button class="channel-btn ${state.texturePreviewChannel === 'r' ? 'active' : ''}" data-channel="r" title="Red Channel">R</button>
          <button class="channel-btn ${state.texturePreviewChannel === 'g' ? 'active' : ''}" data-channel="g" title="Green Channel">G</button>
          <button class="channel-btn ${state.texturePreviewChannel === 'b' ? 'active' : ''}" data-channel="b" title="Blue Channel">B</button>
          <button class="channel-btn ${state.texturePreviewChannel === 'a' ? 'active' : ''}" data-channel="a" title="Alpha Channel">A</button>
        </div>
      </div>
    </div>
  `;
}

function renderTextureSource(tex: TextureData): string {
  const source = tex.source;
  
  return `
    <div class="inspector-section">
      <div class="section-title">Source</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Type</span>
          <span class="property-value type-badge">${source.type}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Loaded</span>
          <span class="property-value ${source.isLoaded ? 'value-true' : 'value-false'}">${source.isLoaded ? 'Yes' : 'No'}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Ready</span>
          <span class="property-value ${source.isReady ? 'value-true' : 'value-false'}">${source.isReady ? 'Yes' : 'No'}</span>
        </div>
        ${source.url ? `
        <div class="property-row url-row">
          <span class="property-label">URL</span>
          <span class="property-value texture-url" title="${escapeHtml(source.url)}">${truncateUrl(source.url)}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderTextureMipmaps(tex: TextureData): string {
  const mip = tex.mipmaps;
  
  return `
    <div class="inspector-section">
      <div class="section-title">Mipmaps</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Enabled</span>
          <span class="property-value ${mip.enabled ? 'value-true' : 'value-false'}">${mip.enabled ? 'Yes' : 'No'}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Generate</span>
          <span class="property-value ${mip.generateMipmaps ? 'value-true' : 'value-false'}">${mip.generateMipmaps ? 'Auto' : 'Manual'}</span>
        </div>
        ${mip.count > 0 ? `
        <div class="property-row">
          <span class="property-label">Levels</span>
          <span class="property-value">${mip.count}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderTextureFiltering(tex: TextureData): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Filtering</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Mag Filter</span>
          <span class="property-value type-badge">${tex.filtering.magName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Min Filter</span>
          <span class="property-value type-badge">${tex.filtering.minName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Anisotropy</span>
          <span class="property-value">${tex.anisotropy}×</span>
        </div>
      </div>
    </div>
  `;
}

function renderTextureWrapping(tex: TextureData): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Wrapping</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Wrap S</span>
          <span class="property-value type-badge">${tex.wrap.sName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Wrap T</span>
          <span class="property-value type-badge">${tex.wrap.tName}</span>
        </div>
      </div>
    </div>
  `;
}

function renderTextureFlags(tex: TextureData): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Flags</div>
      <div class="texture-flags">
        <div class="flag-item ${tex.flipY ? 'enabled' : ''}">
          <span class="flag-icon">↕️</span>
          <span class="flag-label">Flip Y</span>
        </div>
        <div class="flag-item ${tex.premultiplyAlpha ? 'enabled' : ''}">
          <span class="flag-icon">α</span>
          <span class="flag-label">Premultiply Alpha</span>
        </div>
        <div class="flag-item ${tex.isCompressed ? 'enabled' : ''}">
          <span class="flag-icon">📦</span>
          <span class="flag-label">Compressed</span>
        </div>
        <div class="flag-item ${tex.isCubeTexture ? 'enabled' : ''}">
          <span class="flag-icon">🎲</span>
          <span class="flag-label">Cube Map</span>
        </div>
        <div class="flag-item ${tex.isDataTexture ? 'enabled' : ''}">
          <span class="flag-icon">📊</span>
          <span class="flag-label">Data Texture</span>
        </div>
        <div class="flag-item ${tex.isRenderTarget ? 'enabled' : ''}">
          <span class="flag-icon">🎯</span>
          <span class="flag-label">Render Target</span>
        </div>
      </div>
    </div>
  `;
}

function renderTextureUsage(tex: TextureData): string {
  if (tex.usedByMaterials.length === 0) {
    return `
      <div class="inspector-section">
        <div class="section-title">Usage</div>
        <div class="no-usage">Not used by any materials</div>
      </div>
    `;
  }

  return `
    <div class="inspector-section">
      <div class="section-title">Usage (${tex.usedByMaterials.length})</div>
      <div class="texture-usage-list">
        ${tex.usedByMaterials.map(usage => `
          <div class="texture-usage-item">
            <span class="usage-slot">${usage.slot}</span>
            <span class="usage-material">${escapeHtml(usage.materialName)}</span>
            <span class="usage-uuid">${usage.materialUuid.substring(0, 8)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getTextureIcon(tex: TextureData): string {
  if (tex.isCubeTexture) return '🎲';
  if (tex.isVideoTexture) return '🎬';
  if (tex.isCanvasTexture) return '🎨';
  if (tex.isDataTexture) return '📊';
  if (tex.isRenderTarget) return '🎯';
  if (tex.isCompressed) return '📦';
  return '🖼️';
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  
  // Try to show filename
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  if (filename.length < maxLen - 3) {
    return '...' + filename;
  }
  
  return url.substring(0, maxLen - 3) + '...';
}

function attachTextureEvents(): void {
  // Texture list item selection
  document.querySelectorAll('.texture-item').forEach((item) => {
    const itemEl = item as HTMLElement;
    const uuid = itemEl.dataset.uuid;

    itemEl.addEventListener('click', () => {
      if (!uuid) return;
      state.selectedTextureId = uuid;
      renderTextures();
    });
  });

  // Channel toggle buttons
  document.querySelectorAll('.channel-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const channel = btnEl.dataset.channel as PanelState['texturePreviewChannel'];

    btnEl.addEventListener('click', () => {
      if (!channel) return;
      state.texturePreviewChannel = channel;
      renderTextures();
    });
  });
}

// ───────────────────────────────────────────────────────────────
// Render Targets Tab
// ───────────────────────────────────────────────────────────────

function renderRenderTargets(): void {
  const content = document.getElementById('content');
  if (!content) return;

  const renderTargets = state.snapshot?.renderTargets;
  const summary = state.snapshot?.renderTargetsSummary;

  if (!renderTargets?.length) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📺</div>
        <h2>No Render Targets</h2>
        <p>No render targets found in observed scenes.</p>
        <p class="hint">Render targets are created for effects like shadows, reflections, and post-processing.</p>
      </div>
    `;
    return;
  }

  // Find selected render target
  const selectedTarget = state.selectedRenderTargetId
    ? renderTargets.find(rt => rt.uuid === state.selectedRenderTargetId)
    : null;

  const html = `
    <div class="render-targets-split-view">
      <div class="render-targets-list-panel">
        ${renderRenderTargetsSummary(summary)}
        <div class="render-targets-grid">
          ${renderTargets.map(rt => renderRenderTargetGridItem(rt)).join('')}
        </div>
      </div>
      <div class="render-targets-inspector-panel">
        ${selectedTarget ? renderRenderTargetInspector(selectedTarget) : renderNoRenderTargetSelected()}
      </div>
    </div>
  `;

  content.innerHTML = html;
  attachRenderTargetEvents();
}

function renderRenderTargetsSummary(summary: SceneSnapshot['renderTargetsSummary']): string {
  if (!summary) return '';

  return `
    <div class="render-targets-summary">
      <div class="summary-stat">
        <span class="summary-value">${summary.totalCount}</span>
        <span class="summary-label">Targets</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${formatBytes(summary.totalMemoryBytes)}</span>
        <span class="summary-label">GPU Memory</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.shadowMapCount}</span>
        <span class="summary-label">Shadows</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.postProcessCount}</span>
        <span class="summary-label">Post FX</span>
      </div>
      <div class="summary-stat">
        <span class="summary-value">${summary.msaaCount}</span>
        <span class="summary-label">MSAA</span>
      </div>
    </div>
  `;
}

function renderRenderTargetGridItem(rt: RenderTargetData): string {
  const isSelected = state.selectedRenderTargetId === rt.uuid;
  const displayName = rt.name || `<${rt.type}>`;
  const rtIcon = getRenderTargetIcon(rt);
  const dimensionText = `${rt.dimensions.width}×${rt.dimensions.height}`;

  return `
    <div class="rt-grid-item ${isSelected ? 'selected' : ''}" data-uuid="${rt.uuid}">
      <div class="rt-grid-thumbnail">
        ${rt.thumbnail 
          ? `<img src="${rt.thumbnail}" alt="${escapeHtml(displayName)}" class="rt-thumb-img" />`
          : `<div class="rt-thumb-placeholder">${rtIcon}</div>`
        }
        ${rt.hasDepthTexture ? '<div class="rt-depth-indicator" title="Has Depth Texture">D</div>' : ''}
        ${rt.samples > 0 ? `<div class="rt-msaa-indicator" title="${rt.samples}x MSAA">${rt.samples}x</div>` : ''}
      </div>
      <div class="rt-grid-info">
        <div class="rt-grid-name" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</div>
        <div class="rt-grid-meta">
          <span class="rt-dimensions">${dimensionText}</span>
          <span class="rt-usage-badge ${getRTUsageBadgeClass(rt.usage)}">${getRTUsageDisplayName(rt.usage)}</span>
        </div>
        <div class="rt-grid-stats">
          <span class="rt-memory">${formatBytes(rt.memoryBytes)}</span>
          ${rt.colorAttachmentCount > 1 ? `<span class="rt-mrt-badge">MRT×${rt.colorAttachmentCount}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderNoRenderTargetSelected(): string {
  return `
    <div class="no-selection">
      <div class="no-selection-icon">📺</div>
      <div class="no-selection-text">Select a render target to inspect</div>
    </div>
  `;
}

function renderRenderTargetInspector(rt: RenderTargetData): string {
  const rtIcon = getRenderTargetIcon(rt);
  const dimensionText = `${rt.dimensions.width} × ${rt.dimensions.height}`;

  return `
    <div class="inspector-header rt-header">
      <div class="rt-header-thumb">
        ${rt.thumbnail 
          ? `<img src="${rt.thumbnail}" alt="Preview" class="rt-header-img" />`
          : `<div class="rt-header-placeholder">${rtIcon}</div>`
        }
      </div>
      <div class="inspector-header-text">
        <span class="inspector-title">${escapeHtml(rt.name || `<${rt.type}>`)}</span>
        <span class="inspector-subtitle">${rt.type}</span>
      </div>
      <span class="inspector-uuid">${rt.uuid.substring(0, 8)}</span>
    </div>

    ${renderRTPreview(rt)}

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Dimensions</span>
          <span class="property-value">${dimensionText}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Usage</span>
          <span class="property-value type-badge">${getRTUsageDisplayName(rt.usage)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Format</span>
          <span class="property-value type-badge">${rt.textureFormatName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Data Type</span>
          <span class="property-value">${rt.textureTypeName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Memory (est.)</span>
          <span class="property-value memory-value">${formatBytes(rt.memoryBytes)}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Color Space</span>
          <span class="property-value">${rt.colorSpace}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Render Count</span>
          <span class="property-value">${rt.renderCount.toLocaleString()}</span>
        </div>
      </div>
    </div>

    ${renderRTBuffers(rt)}
    ${renderRTMRT(rt)}
    ${renderRTFiltering(rt)}
    ${renderRTWrapping(rt)}
    ${renderRTActions(rt)}
  `;
}

function renderRTPreview(rt: RenderTargetData): string {
  const hasThumbnail = rt.thumbnail || rt.depthThumbnail;
  if (!hasThumbnail) return '';

  const mode = state.renderTargetPreviewMode;
  const showDepth = mode === 'depth' || mode === 'heatmap';
  const currentThumbnail = showDepth && rt.depthThumbnail ? rt.depthThumbnail : rt.thumbnail;

  return `
    <div class="inspector-section rt-preview-section">
      <div class="section-title">Preview</div>
      <div class="rt-preview-container">
        ${currentThumbnail 
          ? `<img src="${currentThumbnail}" alt="Render Target Preview" class="rt-preview-img channel-${mode}" style="transform: scale(${state.renderTargetZoom})" />`
          : `<div class="rt-preview-placeholder">No preview available</div>`
        }
        <div class="rt-preview-controls">
          <div class="rt-channel-toggles">
            <button class="channel-btn ${mode === 'color' ? 'active' : ''}" data-mode="color" title="Color (RGB)">RGB</button>
            <button class="channel-btn ${mode === 'r' ? 'active' : ''}" data-mode="r" title="Red Channel">R</button>
            <button class="channel-btn ${mode === 'g' ? 'active' : ''}" data-mode="g" title="Green Channel">G</button>
            <button class="channel-btn ${mode === 'b' ? 'active' : ''}" data-mode="b" title="Blue Channel">B</button>
            <button class="channel-btn ${mode === 'a' ? 'active' : ''}" data-mode="a" title="Alpha Channel">A</button>
            ${rt.hasDepthTexture ? `
              <span class="channel-separator"></span>
              <button class="channel-btn depth ${mode === 'depth' ? 'active' : ''}" data-mode="depth" title="Depth">Depth</button>
              <button class="channel-btn heatmap ${mode === 'heatmap' ? 'active' : ''}" data-mode="heatmap" title="Depth Heatmap">🌡️</button>
            ` : ''}
          </div>
          <div class="rt-zoom-controls">
            <button class="zoom-btn" data-zoom="out" title="Zoom Out">−</button>
            <span class="zoom-level">${Math.round(state.renderTargetZoom * 100)}%</span>
            <button class="zoom-btn" data-zoom="in" title="Zoom In">+</button>
            <button class="zoom-btn" data-zoom="fit" title="Fit to View">⊡</button>
          </div>
        </div>
        <div class="rt-pixel-info" id="rt-pixel-info">
          <span class="pixel-coords">—</span>
          <span class="pixel-value">Hover to inspect</span>
        </div>
      </div>
    </div>
  `;
}

function renderRTBuffers(rt: RenderTargetData): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Buffers</div>
      <div class="rt-buffers">
        <div class="rt-buffer-item ${rt.depthBuffer ? 'enabled' : ''}">
          <span class="buffer-icon">📐</span>
          <span class="buffer-label">Depth Buffer</span>
          <span class="buffer-status">${rt.depthBuffer ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div class="rt-buffer-item ${rt.stencilBuffer ? 'enabled' : ''}">
          <span class="buffer-icon">✂️</span>
          <span class="buffer-label">Stencil Buffer</span>
          <span class="buffer-status">${rt.stencilBuffer ? 'Enabled' : 'Disabled'}</span>
        </div>
        <div class="rt-buffer-item ${rt.hasDepthTexture ? 'enabled' : ''}">
          <span class="buffer-icon">🗺️</span>
          <span class="buffer-label">Depth Texture</span>
          <span class="buffer-status">${rt.hasDepthTexture ? rt.depthTextureFormatName || 'Yes' : 'None'}</span>
        </div>
        ${rt.samples > 0 ? `
        <div class="rt-buffer-item enabled msaa">
          <span class="buffer-icon">🔲</span>
          <span class="buffer-label">MSAA</span>
          <span class="buffer-status">${rt.samples}x samples</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderRTMRT(rt: RenderTargetData): string {
  if (rt.colorAttachmentCount <= 1) return '';

  return `
    <div class="inspector-section">
      <div class="section-title">Multiple Render Targets</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Color Attachments</span>
          <span class="property-value mrt-value">${rt.colorAttachmentCount}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Total Size</span>
          <span class="property-value">${rt.dimensions.width} × ${rt.dimensions.height} × ${rt.colorAttachmentCount}</span>
        </div>
      </div>
      <div class="mrt-attachments">
        ${Array.from({ length: rt.colorAttachmentCount }, (_, i) => `
          <div class="mrt-attachment">
            <span class="attachment-index">${i}</span>
            <span class="attachment-format">${rt.textureFormatName}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRTFiltering(rt: RenderTargetData): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Filtering</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Mag Filter</span>
          <span class="property-value type-badge">${rt.filtering.magName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Min Filter</span>
          <span class="property-value type-badge">${rt.filtering.minName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Generate Mipmaps</span>
          <span class="property-value ${rt.generateMipmaps ? 'value-true' : 'value-false'}">${rt.generateMipmaps ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderRTWrapping(rt: RenderTargetData): string {
  return `
    <div class="inspector-section">
      <div class="section-title">Wrapping</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Wrap S</span>
          <span class="property-value type-badge">${rt.wrap.sName}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Wrap T</span>
          <span class="property-value type-badge">${rt.wrap.tName}</span>
        </div>
        ${rt.scissorTest ? `
        <div class="property-row">
          <span class="property-label">Scissor Test</span>
          <span class="property-value value-true">Enabled</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderRTActions(rt: RenderTargetData): string {
  return `
    <div class="inspector-actions rt-actions">
      <button class="action-btn" data-action="save-color" data-uuid="${rt.uuid}" title="Save color attachment as image">
        <span class="btn-icon">💾</span>
        Save Color
      </button>
      ${rt.hasDepthTexture ? `
      <button class="action-btn" data-action="save-depth" data-uuid="${rt.uuid}" title="Save depth texture as image">
        <span class="btn-icon">🗺️</span>
        Save Depth
      </button>
      ` : ''}
      <button class="action-btn" data-action="refresh-rt" data-uuid="${rt.uuid}" title="Refresh preview">
        <span class="btn-icon">🔄</span>
        Refresh
      </button>
    </div>
  `;
}

function getRenderTargetIcon(rt: RenderTargetData): string {
  switch (rt.usage) {
    case 'shadow-map': return '🌑';
    case 'post-process': return '✨';
    case 'reflection': return '🪞';
    case 'refraction': return '💎';
    case 'environment': return '🌍';
    case 'picker': return '🎯';
    case 'custom': return '🔧';
    default: return '📺';
  }
}

function getRTUsageDisplayName(usage: RenderTargetData['usage']): string {
  switch (usage) {
    case 'shadow-map': return 'Shadow Map';
    case 'post-process': return 'Post Process';
    case 'reflection': return 'Reflection';
    case 'refraction': return 'Refraction';
    case 'environment': return 'Environment';
    case 'picker': return 'Picker';
    case 'custom': return 'Custom';
    default: return 'Unknown';
  }
}

function getRTUsageBadgeClass(usage: RenderTargetData['usage']): string {
  switch (usage) {
    case 'shadow-map': return 'shadow';
    case 'post-process': return 'postprocess';
    case 'reflection': return 'reflection';
    case 'refraction': return 'refraction';
    case 'environment': return 'environment';
    default: return '';
  }
}

function attachRenderTargetEvents(): void {
  // Render target grid item selection
  document.querySelectorAll('.rt-grid-item').forEach((item) => {
    const itemEl = item as HTMLElement;
    const uuid = itemEl.dataset.uuid;

    itemEl.addEventListener('click', () => {
      if (!uuid) return;
      state.selectedRenderTargetId = uuid;
      renderRenderTargets();
    });
  });

  // Channel/mode toggle buttons
  document.querySelectorAll('.rt-channel-toggles .channel-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const mode = btnEl.dataset.mode as PanelState['renderTargetPreviewMode'];

    btnEl.addEventListener('click', () => {
      if (!mode) return;
      state.renderTargetPreviewMode = mode;
      renderRenderTargets();
    });
  });

  // Zoom controls
  document.querySelectorAll('.zoom-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const action = btnEl.dataset.zoom;

    btnEl.addEventListener('click', () => {
      if (!action) return;
      
      switch (action) {
        case 'in':
          state.renderTargetZoom = Math.min(4, state.renderTargetZoom * 1.25);
          break;
        case 'out':
          state.renderTargetZoom = Math.max(0.25, state.renderTargetZoom / 1.25);
          break;
        case 'fit':
          state.renderTargetZoom = 1;
          break;
      }
      
      renderRenderTargets();
    });
  });

  // Save buttons
  document.querySelectorAll('[data-action="save-color"], [data-action="save-depth"]').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const action = btnEl.dataset.action;
    const uuid = btnEl.dataset.uuid;

    btnEl.addEventListener('click', () => {
      if (!uuid) return;
      const rt = state.snapshot?.renderTargets?.find(r => r.uuid === uuid);
      if (!rt) return;

      const dataUrl = action === 'save-depth' && rt.depthThumbnail 
        ? rt.depthThumbnail 
        : rt.thumbnail;
      
      if (!dataUrl) return;

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${rt.name || 'render-target'}-${action === 'save-depth' ? 'depth' : 'color'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Pixel inspection on preview hover
  const previewImg = document.querySelector('.rt-preview-img') as HTMLImageElement;
  const pixelInfo = document.querySelector('#rt-pixel-info') as HTMLElement;

  if (previewImg && pixelInfo) {
    previewImg.addEventListener('mousemove', (e) => {
      const rect = previewImg.getBoundingClientRect();
      const x = Math.floor(((e.clientX - rect.left) / rect.width) * previewImg.naturalWidth);
      const y = Math.floor(((e.clientY - rect.top) / rect.height) * previewImg.naturalHeight);
      
      const coordsEl = pixelInfo.querySelector('.pixel-coords');
      const valueEl = pixelInfo.querySelector('.pixel-value');
      
      if (coordsEl) coordsEl.textContent = `(${x}, ${y})`;
      if (valueEl) valueEl.textContent = 'Inspecting...';
    });

    previewImg.addEventListener('mouseleave', () => {
      const coordsEl = pixelInfo.querySelector('.pixel-coords');
      const valueEl = pixelInfo.querySelector('.pixel-value');
      
      if (coordsEl) coordsEl.textContent = '—';
      if (valueEl) valueEl.textContent = 'Hover to inspect';
    });
  }
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
  // Visibility toggle buttons (eye icons)
  document.querySelectorAll('.node-visibility-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const id = btnEl.dataset.id;

    btnEl.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger node selection
      if (id) {
        port.postMessage({ type: 'toggle-visibility', debugId: id });
        requestSnapshot();
      }
    });
  });

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

      // Ignore if clicking visibility button
      if ((e.target as HTMLElement).closest('.node-visibility-btn')) {
        return;
      }

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
