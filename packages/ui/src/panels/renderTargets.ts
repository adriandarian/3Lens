/**
 * Render Targets Panel - Shared renderer for render target inspection
 */

import type { PanelContext, UIState, RenderTargetData, SceneSnapshot } from '../types';
import { escapeHtml, formatBytes } from '../utils/format';

/**
 * Get usage display name
 */
function getUsageDisplayName(usage: RenderTargetData['usage']): string {
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

/**
 * Get icon for render target based on its usage
 */
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

/**
 * Get usage badge class
 */
function getUsageBadgeClass(usage: RenderTargetData['usage']): string {
  switch (usage) {
    case 'shadow-map': return 'shadow';
    case 'post-process': return 'postprocess';
    case 'reflection': return 'reflection';
    case 'refraction': return 'refraction';
    case 'environment': return 'environment';
    default: return '';
  }
}

/**
 * Render the render targets panel content
 */
export function renderRenderTargetsPanel(
  context: PanelContext,
  state: UIState
): string {
  const renderTargets = context.snapshot?.renderTargets;
  const summary = context.snapshot?.renderTargetsSummary;

  if (!renderTargets?.length) {
    return `
      <div class="panel-empty-state">
        <div class="empty-icon">📺</div>
        <h2>No Render Targets</h2>
        <p>No render targets found in observed scenes.</p>
        <p class="hint">Render targets are created for effects like shadows, reflections, and post-processing.</p>
      </div>
    `;
  }

  const selectedTarget = state.selectedRenderTargetId
    ? renderTargets.find((rt: RenderTargetData) => rt.uuid === state.selectedRenderTargetId)
    : null;

  return `
    <div class="panel-split-view render-targets-split-view">
      <div class="panel-list render-targets-list-panel">
        ${renderRenderTargetsSummary(summary)}
        <div class="render-targets-grid">
          ${renderTargets.map((rt: RenderTargetData) => renderRenderTargetGridItem(rt, state)).join('')}
        </div>
      </div>
      <div class="panel-inspector render-targets-inspector-panel">
        ${selectedTarget ? renderRenderTargetInspector(selectedTarget, state) : renderNoTargetSelected()}
      </div>
    </div>
  `;
}

function renderRenderTargetsSummary(summary: SceneSnapshot['renderTargetsSummary']): string {
  if (!summary) return '';

  return `
    <div class="panel-summary render-targets-summary">
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

function renderRenderTargetGridItem(rt: RenderTargetData, state: UIState): string {
  const isSelected = state.selectedRenderTargetId === rt.uuid;
  const displayName = rt.name || `<${rt.type}>`;
  const rtIcon = getRenderTargetIcon(rt);
  const dimensionText = `${rt.dimensions.width}×${rt.dimensions.height}`;

  return `
    <div class="rt-grid-item ${isSelected ? 'selected' : ''}" data-uuid="${rt.uuid}" data-action="select-render-target">
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
          <span class="rt-usage-badge ${getUsageBadgeClass(rt.usage)}">${getUsageDisplayName(rt.usage)}</span>
        </div>
        <div class="rt-grid-stats">
          <span class="rt-memory">${formatBytes(rt.memoryBytes)}</span>
          ${rt.colorAttachmentCount > 1 ? `<span class="rt-mrt-badge">MRT×${rt.colorAttachmentCount}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderNoTargetSelected(): string {
  return `
    <div class="no-selection">
      <div class="no-selection-icon">📺</div>
      <div class="no-selection-text">Select a render target to inspect</div>
    </div>
  `;
}

function renderRenderTargetInspector(rt: RenderTargetData, state: UIState): string {
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

    ${renderRenderTargetPreview(rt, state)}

    <div class="inspector-section">
      <div class="section-title">Overview</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Dimensions</span>
          <span class="property-value">${dimensionText}</span>
        </div>
        <div class="property-row">
          <span class="property-label">Usage</span>
          <span class="property-value type-badge rt-usage-${rt.usage}">${getUsageDisplayName(rt.usage)}</span>
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

    ${renderRenderTargetBuffers(rt)}
    ${renderRenderTargetMRT(rt)}
    ${renderRenderTargetFiltering(rt)}
    ${renderRenderTargetWrapping(rt)}
    ${renderRenderTargetActions(rt)}
  `;
}

function renderRenderTargetPreview(rt: RenderTargetData, state: UIState): string {
  const hasThumbnail = rt.thumbnail || rt.depthThumbnail;
  if (!hasThumbnail) return '';

  const mode = state.renderTargetPreviewMode;
  const showColor = mode === 'color' || mode === 'r' || mode === 'g' || mode === 'b' || mode === 'a';
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

function renderRenderTargetBuffers(rt: RenderTargetData): string {
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

function renderRenderTargetMRT(rt: RenderTargetData): string {
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

function renderRenderTargetFiltering(rt: RenderTargetData): string {
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

function renderRenderTargetWrapping(rt: RenderTargetData): string {
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

function renderRenderTargetActions(rt: RenderTargetData): string {
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
      <button class="action-btn" data-action="refresh" data-uuid="${rt.uuid}" title="Refresh preview">
        <span class="btn-icon">🔄</span>
        Refresh
      </button>
    </div>
  `;
}

/**
 * Attach event handlers for the render targets panel
 */
export function attachRenderTargetsEvents(
  container: HTMLElement,
  _context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void,
  rerender: () => void
): void {
  // Render target grid item selection
  container.querySelectorAll('[data-action="select-render-target"]').forEach((item) => {
    const itemEl = item as HTMLElement;
    const uuid = itemEl.dataset.uuid;

    itemEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!uuid) return;
      // Toggle selection - clicking selected item deselects it
      const newSelection = state.selectedRenderTargetId === uuid ? null : uuid;
      updateState({ selectedRenderTargetId: newSelection });
      rerender();
    });
  });

  // Channel/mode toggle buttons
  container.querySelectorAll('.rt-channel-toggles .channel-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const mode = btnEl.dataset.mode as UIState['renderTargetPreviewMode'];

    btnEl.addEventListener('click', () => {
      if (!mode) return;
      updateState({ renderTargetPreviewMode: mode });
      rerender();
    });
  });

  // Zoom controls
  container.querySelectorAll('.zoom-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const action = btnEl.dataset.zoom;

    btnEl.addEventListener('click', () => {
      if (!action) return;
      let newZoom = state.renderTargetZoom;
      
      switch (action) {
        case 'in':
          newZoom = Math.min(4, newZoom * 1.25);
          break;
        case 'out':
          newZoom = Math.max(0.25, newZoom / 1.25);
          break;
        case 'fit':
          newZoom = 1;
          break;
      }
      
      updateState({ renderTargetZoom: newZoom });
      rerender();
    });
  });

  // Save buttons
  container.querySelectorAll('[data-action="save-color"], [data-action="save-depth"]').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const action = btnEl.dataset.action;
    const uuid = btnEl.dataset.uuid;

    btnEl.addEventListener('click', () => {
      if (!uuid) return;
      const rt = _context.snapshot?.renderTargets?.find(r => r.uuid === uuid);
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
  const previewImg = container.querySelector('.rt-preview-img') as HTMLImageElement;
  const pixelInfo = container.querySelector('#rt-pixel-info') as HTMLElement;

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

