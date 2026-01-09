/**
 * Textures Panel - Shared renderer for texture inspection
 */

import type {
  PanelContext,
  UIState,
  TextureData,
  SceneSnapshot,
} from '../types';
import {
  escapeHtml,
  formatBytes,
  getTextureIcon,
  truncateUrl,
} from '../utils/format';

/**
 * Render the textures panel content
 */
export function renderTexturesPanel(
  context: PanelContext,
  state: UIState
): string {
  const textures = context.snapshot?.textures;
  const summary = context.snapshot?.texturesSummary;

  if (!textures?.length) {
    return `
      <div class="panel-empty-state">
        <div class="empty-icon">🖼️</div>
        <h2>No Textures</h2>
        <p>No textures found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain materials with textures.</p>
      </div>
    `;
  }

  const selectedTexture = state.selectedTextureId
    ? textures.find((t: TextureData) => t.uuid === state.selectedTextureId)
    : null;

  return `
    <div class="panel-split-view textures-split-view">
      <div class="panel-list textures-list-panel">
        ${renderTexturesSummary(summary)}
        <div class="textures-list">
          ${textures.map((tex: TextureData) => renderTextureListItem(tex, state)).join('')}
        </div>
      </div>
      <div class="panel-inspector textures-inspector-panel">
        ${selectedTexture ? renderTextureInspector(selectedTexture, state) : renderNoTextureSelected()}
      </div>
    </div>
  `;
}

function renderTexturesSummary(
  summary: SceneSnapshot['texturesSummary']
): string {
  if (!summary) return '';

  return `
    <div class="panel-summary textures-summary">
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

function renderTextureListItem(tex: TextureData, state: UIState): string {
  const isSelected = state.selectedTextureId === tex.uuid;
  const displayName = tex.name || `<${tex.type}>`;
  const texIcon = getTextureIcon(tex);
  const dimensionText =
    tex.dimensions.width > 0
      ? `${tex.dimensions.width}×${tex.dimensions.height}`
      : 'Unknown';

  return `
    <div class="list-item texture-item ${isSelected ? 'selected' : ''}" data-uuid="${tex.uuid}" data-action="select-texture">
      <div class="texture-item-thumbnail">
        ${
          tex.thumbnail
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

function renderTextureInspector(tex: TextureData, state: UIState): string {
  const texIcon = getTextureIcon(tex);
  const dimensionText =
    tex.dimensions.width > 0
      ? `${tex.dimensions.width} × ${tex.dimensions.height}`
      : 'Unknown';

  return `
    <div class="inspector-header texture-header">
      <div class="texture-header-thumb">
        ${
          tex.thumbnail
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

    ${tex.thumbnail ? renderTexturePreview(tex, state) : ''}

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

function renderTexturePreview(tex: TextureData, state: UIState): string {
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
        ${
          source.url
            ? `
        <div class="property-row url-row">
          <span class="property-label">URL</span>
          <span class="property-value texture-url" title="${escapeHtml(source.url)}">${truncateUrl(source.url)}</span>
        </div>
        `
            : ''
        }
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
        ${
          mip.count > 0
            ? `
        <div class="property-row">
          <span class="property-label">Levels</span>
          <span class="property-value">${mip.count}</span>
        </div>
        `
            : ''
        }
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
        ${tex.usedByMaterials
          .map(
            (usage: TextureData['usedByMaterials'][0]) => `
          <div class="texture-usage-item">
            <span class="usage-slot">${usage.slot}</span>
            <span class="usage-material">${escapeHtml(usage.materialName)}</span>
            <span class="usage-uuid">${usage.materialUuid.substring(0, 8)}</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

/**
 * Attach event handlers for the textures panel
 */
export function attachTexturesEvents(
  container: HTMLElement,
  _context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void,
  rerender: () => void
): void {
  // Texture list item selection
  container
    .querySelectorAll('[data-action="select-texture"]')
    .forEach((item) => {
      const itemEl = item as HTMLElement;
      const uuid = itemEl.dataset.uuid;

      itemEl.addEventListener('click', () => {
        if (!uuid) return;
        // Toggle selection - clicking selected item deselects it
        const newSelection = state.selectedTextureId === uuid ? null : uuid;
        updateState({ selectedTextureId: newSelection });
        rerender();
      });
    });

  // Channel toggle buttons
  container.querySelectorAll('.channel-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const channel = btnEl.dataset.channel as UIState['texturePreviewChannel'];

    btnEl.addEventListener('click', () => {
      if (!channel) return;
      updateState({ texturePreviewChannel: channel });
      rerender();
    });
  });
}
