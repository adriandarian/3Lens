/**
 * Geometry Panel - Shared renderer for geometry inspection
 */

import type { PanelContext, UIState, GeometryData, SceneSnapshot } from '../types';
import { escapeHtml, formatNumber, formatBytes, getGeometryIcon, getShortTypeName } from '../utils/format';

/**
 * Render the geometry panel content
 */
export function renderGeometryPanel(
  context: PanelContext,
  state: UIState
): string {
  const geometries = context.snapshot?.geometries;
  const summary = context.snapshot?.geometriesSummary;

  if (!geometries?.length) {
    return `
      <div class="panel-empty-state">
        <div class="empty-icon">📐</div>
        <h2>No Geometries</h2>
        <p>No geometries found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with geometries.</p>
      </div>
    `;
  }

  const selectedGeometry = state.selectedGeometryId
    ? geometries.find((g: GeometryData) => g.uuid === state.selectedGeometryId)
    : null;

  return `
    <div class="panel-split-view geometry-split-view">
      <div class="panel-list geometry-list-panel">
        ${renderGeometrySummary(summary)}
        <div class="geometry-list">
          ${geometries.map((geo: GeometryData) => renderGeometryListItem(geo, state)).join('')}
        </div>
      </div>
      <div class="panel-inspector geometry-inspector-panel">
        ${selectedGeometry ? renderGeometryInspector(selectedGeometry, state) : renderNoGeometrySelected()}
      </div>
    </div>
  `;
}

function renderGeometrySummary(summary: SceneSnapshot['geometriesSummary']): string {
  if (!summary) return '';

  return `
    <div class="panel-summary geometry-summary">
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

function renderGeometryListItem(geo: GeometryData, state: UIState): string {
  const isSelected = state.selectedGeometryId === geo.uuid;
  const displayName = geo.name || `<${geo.type}>`;
  const geoIcon = getGeometryIcon(geo.type);

  return `
    <div class="list-item geometry-item ${isSelected ? 'selected' : ''}" data-uuid="${geo.uuid}" data-action="select-geometry">
      <div class="geometry-item-icon">${geoIcon}</div>
      <div class="geometry-item-info">
        <div class="geometry-item-name">${escapeHtml(displayName)}</div>
        <div class="geometry-item-meta">
          <span>${geo.type}</span>
          <span>${geo.attributes.length} attrs</span>
          ${geo.isIndexed ? '<span>indexed</span>' : ''}
        </div>
      </div>
      <div class="geometry-item-stats">
        <span class="geo-stat-pill vertices">${formatNumber(geo.vertexCount)} v</span>
        <span class="geo-stat-pill triangles">${formatNumber(geo.faceCount)} △</span>
        <span class="geo-stat-pill memory">${formatBytes(geo.memoryBytes)}</span>
      </div>
      <div class="geometry-item-usage">${geo.usageCount}×</div>
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

function renderGeometryInspector(geo: GeometryData, state: UIState): string {
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
          ${attributes.map((attr: GeometryData['attributes'][0]) => `
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
        ${groups.map((group: GeometryData['groups'][0], i: number) => `
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
        ${morphs.map((morph: { name: string; count: number }) => `
          <div class="morph-item">
            <span class="morph-name">${morph.name}</span>
            <span class="morph-count">×${morph.count}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Attach event handlers for the geometry panel
 */
export function attachGeometryEvents(
  container: HTMLElement,
  context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void,
  rerender: () => void
): void {
  // Geometry list item selection
  container.querySelectorAll('[data-action="select-geometry"]').forEach((item) => {
    const itemEl = item as HTMLElement;
    const uuid = itemEl.dataset.uuid;

    itemEl.addEventListener('click', () => {
      if (!uuid) return;
      updateState({ selectedGeometryId: uuid });
      rerender();
    });
  });

  // Action buttons
  container.querySelectorAll('.action-btn').forEach((btn) => {
    const btnEl = btn as HTMLElement;
    const action = btnEl.dataset.action;
    const uuid = btnEl.dataset.uuid;

    if (!action || !uuid) return;

    btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      handleGeometryAction(action, uuid, context, state, updateState, rerender);
    });
  });
}

function handleGeometryAction(
  action: string,
  geometryUuid: string,
  context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void,
  rerender: () => void
): void {
  const viz = state.geometryVisualization;
  
  switch (action) {
    case 'toggle-bbox': {
      const newSet = new Set(viz.boundingBox);
      if (newSet.has(geometryUuid)) {
        newSet.delete(geometryUuid);
      } else {
        newSet.add(geometryUuid);
      }
      updateState({
        geometryVisualization: { ...viz, boundingBox: newSet }
      });
      context.sendCommand({
        type: 'geometry-visualization',
        geometryUuid,
        visualization: 'boundingBox',
        enabled: newSet.has(geometryUuid),
      });
      rerender();
      break;
    }
    case 'toggle-wireframe': {
      const newSet = new Set(viz.wireframe);
      if (newSet.has(geometryUuid)) {
        newSet.delete(geometryUuid);
      } else {
        newSet.add(geometryUuid);
      }
      updateState({
        geometryVisualization: { ...viz, wireframe: newSet }
      });
      context.sendCommand({
        type: 'geometry-visualization',
        geometryUuid,
        visualization: 'wireframe',
        enabled: newSet.has(geometryUuid),
      });
      rerender();
      break;
    }
    case 'toggle-normals': {
      const newSet = new Set(viz.normals);
      if (newSet.has(geometryUuid)) {
        newSet.delete(geometryUuid);
      } else {
        newSet.add(geometryUuid);
      }
      updateState({
        geometryVisualization: { ...viz, normals: newSet }
      });
      context.sendCommand({
        type: 'geometry-visualization',
        geometryUuid,
        visualization: 'normals',
        enabled: newSet.has(geometryUuid),
      });
      rerender();
      break;
    }
  }
}

