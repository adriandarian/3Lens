/**
 * Materials Panel - Shared renderer for materials inspection
 */

import type { PanelContext, UIState, MaterialData, SceneSnapshot, SceneNode } from '../types';
import { escapeHtml, getMaterialTypeIcon } from '../utils/format';
import { highlightGLSL, truncateShader } from '../utils/glsl-highlight';

/**
 * Build a map of debug ID -> mesh name from the scene tree
 */
function buildMeshNameMap(snapshot: SceneSnapshot | null): Map<string, string> {
  const map = new Map<string, string>();
  if (!snapshot?.scenes) return map;

  function traverse(node: SceneNode) {
    // Use the object's name, or fallback to type
    const name = node.ref.name || node.ref.type;
    map.set(node.ref.debugId, name);
    
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  for (const scene of snapshot.scenes) {
    traverse(scene);
  }

  return map;
}

/**
 * Render the materials panel content
 */
export function renderMaterialsPanel(
  context: PanelContext,
  state: UIState
): string {
  const materials = context.snapshot?.materials;
  const summary = context.snapshot?.materialsSummary;

  if (!materials?.length) {
    return `
      <div class="panel-empty-state">
        <div class="empty-icon">🎨</div>
        <h2>No Materials</h2>
        <p>No materials found in observed scenes.</p>
        <p class="hint">Make sure scenes are being observed and contain meshes with materials.</p>
      </div>
    `;
  }

  // Build a map of debugId -> name from the scene tree
  const meshNames = buildMeshNameMap(context.snapshot);

  // Filter materials by search query
  const searchQuery = state.materialsSearch.toLowerCase().trim();
  const filteredMaterials = searchQuery
    ? materials.filter((mat: MaterialData) => {
        const matName = (mat.name || mat.type).toLowerCase();
        const meshNamesList = mat.usedByMeshes
          .map(id => meshNames.get(id) || '')
          .join(' ')
          .toLowerCase();
        return matName.includes(searchQuery) || meshNamesList.includes(searchQuery);
      })
    : materials;

  const selectedMaterial = state.selectedMaterialId
    ? materials.find((m: MaterialData) => m.uuid === state.selectedMaterialId)
    : null;

  return `
    <div class="panel-split-view materials-split-view">
      <div class="panel-list materials-list-panel">
        ${renderMaterialsSummary(summary)}
        <div class="materials-list">
          ${filteredMaterials.length > 0 
            ? filteredMaterials.map((mat: MaterialData) => renderMaterialListItem(mat, state, meshNames)).join('')
            : `<div class="no-results">No materials match "${escapeHtml(state.materialsSearch)}"</div>`
          }
        </div>
      </div>
      <div class="panel-inspector materials-inspector-panel">
        ${selectedMaterial ? renderMaterialInspector(selectedMaterial, meshNames) : renderNoMaterialSelected()}
      </div>
    </div>
  `;
}

function renderMaterialsSummary(summary: SceneSnapshot['materialsSummary']): string {
  if (!summary) return '';

  return `
    <div class="panel-summary materials-summary">
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

function renderMaterialListItem(mat: MaterialData, state: UIState, meshNames: Map<string, string>): string {
  const isSelected = state.selectedMaterialId === mat.uuid;
  const colorHex = mat.color !== undefined ? mat.color.toString(16).padStart(6, '0') : null;
  const typeIcon = getMaterialTypeIcon(mat.type);
  
  // Get mesh names that use this material
  const usedByNames = mat.usedByMeshes
    .map(debugId => meshNames.get(debugId) || debugId.substring(0, 8))
    .slice(0, 3); // Show max 3 names
  const moreCount = mat.usedByMeshes.length - usedByNames.length;
  
  // Title: material name or type
  const displayName = mat.name || mat.type;
  
  // Subtitle: object names that use this material
  const subtitle = usedByNames.join(', ') + (moreCount > 0 ? ` +${moreCount}` : '');
  
  return `
    <div class="list-item material-item ${isSelected ? 'selected' : ''}" data-uuid="${mat.uuid}" data-action="select-material">
      <div class="material-item-color">
        ${colorHex ? `<span class="color-swatch" style="background: #${colorHex};"></span>` : '<span class="color-swatch no-color">∅</span>'}
      </div>
      <div class="material-item-info">
        <div class="material-item-name">${escapeHtml(displayName)}</div>
        <div class="material-item-type">
          <span class="type-icon">${typeIcon}</span>
          ${escapeHtml(subtitle)}
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

function renderMaterialInspector(mat: MaterialData, meshNames: Map<string, string>): string {
  const colorHex = mat.color !== undefined ? mat.color.toString(16).padStart(6, '0') : null;
  const emissiveHex = mat.emissive !== undefined ? mat.emissive.toString(16).padStart(6, '0') : null;

  // Get mesh names that use this material
  const usedByList = mat.usedByMeshes.map(debugId => ({
    debugId,
    name: meshNames.get(debugId) || debugId.substring(0, 8),
  }));

  // Title: material name or type
  const displayName = mat.name || mat.type;

  return `
    <div class="inspector-header material-header">
      ${colorHex ? `<span class="color-swatch large" style="background: #${colorHex};"></span>` : ''}
      <div class="inspector-header-text">
        <span class="inspector-title">${escapeHtml(displayName)}</span>
        <span class="inspector-subtitle">${mat.type}</span>
      </div>
      <span class="inspector-uuid">${mat.uuid.substring(0, 8)}</span>
    </div>

    <div class="inspector-section used-by-section">
      <div class="section-title">Used By (${usedByList.length})</div>
      <div class="used-by-list">
        ${usedByList.map(item => `
          <div class="used-by-item" data-debug-id="${item.debugId}">
            <span class="mesh-icon">M</span>
            <span class="mesh-name">${escapeHtml(item.name)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="inspector-section">
      <div class="section-title">Properties</div>
      <div class="property-grid">
        ${colorHex !== null ? `
        <div class="property-row">
          <span class="property-label">Color</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="color" data-material="${mat.uuid}" value="#${colorHex}" />
            <span class="color-hex">#${colorHex.toUpperCase()}</span>
          </span>
        </div>
        ` : ''}
        ${emissiveHex !== null ? `
        <div class="property-row">
          <span class="property-label">Emissive</span>
          <span class="property-value editable">
            <input type="color" class="prop-color-input" data-property="emissive" data-material="${mat.uuid}" value="#${emissiveHex}" />
            <span class="color-hex">#${emissiveHex.toUpperCase()}</span>
          </span>
        </div>
        ` : ''}
        <div class="property-row">
          <span class="property-label">Opacity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="opacity" data-material="${mat.uuid}"
                   min="0" max="1" step="0.01" value="${mat.opacity}" />
            <span class="range-value">${mat.opacity.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Transparent</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="transparent" data-material="${mat.uuid}" ${mat.transparent ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Visible</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="visible" data-material="${mat.uuid}" ${mat.visible ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Side</span>
          <span class="property-value editable">
            <select class="prop-select-input" data-property="side" data-material="${mat.uuid}">
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
              <input type="checkbox" class="prop-checkbox-input" data-property="wireframe" data-material="${mat.uuid}" ${mat.wireframe ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Test</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthTest" data-material="${mat.uuid}" ${mat.depthTest ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Depth Write</span>
          <span class="property-value editable">
            <label class="toggle-switch">
              <input type="checkbox" class="prop-checkbox-input" data-property="depthWrite" data-material="${mat.uuid}" ${mat.depthWrite ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </span>
        </div>
      </div>
    </div>

    ${mat.pbr ? renderPBRSection(mat.pbr, mat.uuid) : ''}
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

function renderPBRSection(pbr: NonNullable<MaterialData['pbr']>, materialUuid: string): string {
  return `
    <div class="inspector-section">
      <div class="section-title">PBR Properties</div>
      <div class="property-grid">
        <div class="property-row">
          <span class="property-label">Roughness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider" data-property="roughness" data-material="${materialUuid}"
                   min="0" max="1" step="0.01" value="${pbr.roughness}" />
            <span class="range-value">${pbr.roughness.toFixed(2)}</span>
          </span>
        </div>
        <div class="property-row">
          <span class="property-label">Metalness</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input pbr-slider metalness" data-property="metalness" data-material="${materialUuid}"
                   min="0" max="1" step="0.01" value="${pbr.metalness}" />
            <span class="range-value">${pbr.metalness.toFixed(2)}</span>
          </span>
        </div>
        ${pbr.reflectivity !== undefined ? `
        <div class="property-row">
          <span class="property-label">Reflectivity</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="reflectivity" data-material="${materialUuid}"
                   min="0" max="1" step="0.01" value="${pbr.reflectivity}" />
            <span class="range-value">${pbr.reflectivity.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
        ${pbr.clearcoat !== undefined ? `
        <div class="property-row">
          <span class="property-label">Clearcoat</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="clearcoat" data-material="${materialUuid}"
                   min="0" max="1" step="0.01" value="${pbr.clearcoat}" />
            <span class="range-value">${pbr.clearcoat.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
        ${pbr.transmission !== undefined ? `
        <div class="property-row">
          <span class="property-label">Transmission</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="transmission" data-material="${materialUuid}"
                   min="0" max="1" step="0.01" value="${pbr.transmission}" />
            <span class="range-value">${pbr.transmission.toFixed(2)}</span>
          </span>
        </div>
        ` : ''}
        ${pbr.ior !== undefined ? `
        <div class="property-row">
          <span class="property-label">IOR</span>
          <span class="property-value editable">
            <input type="range" class="prop-range-input" data-property="ior" data-material="${materialUuid}"
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
        ${textures.map((tex: MaterialData['textures'][0]) => `
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
          ${shader.uniforms.map((u: { type: string; name: string; value: unknown }) => `
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

function formatUniformValue(uniform: { type: string; name: string; value: unknown }): string {
  const val = uniform.value;
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'number') return val.toFixed(4);
  if (typeof val === 'object') {
    if ('x' in val && 'y' in val && 'z' in val && 'w' in val) {
      const v = val as { x: number; y: number; z: number; w: number };
      return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}, ${v.w.toFixed(2)})`;
    }
    if ('x' in val && 'y' in val && 'z' in val) {
      const v = val as { x: number; y: number; z: number };
      return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
    }
    if ('r' in val && 'g' in val && 'b' in val) {
      const v = val as { r: number; g: number; b: number };
      return `rgb(${v.r.toFixed(2)}, ${v.g.toFixed(2)}, ${v.b.toFixed(2)})`;
    }
    if ('x' in val && 'y' in val) {
      const v = val as { x: number; y: number };
      return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`;
    }
    if ('uuid' in val) {
      return `texture:${(val as { uuid: string }).uuid.substring(0, 8)}`;
    }
    if (Array.isArray(val)) {
      return `[${val.length}]`;
    }
  }
  return String(val);
}

/**
 * Attach event handlers for the materials panel
 */
export function attachMaterialsEvents(
  container: HTMLElement,
  context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void,
  rerender: () => void
): void {
  // Material list item selection
  container.querySelectorAll('[data-action="select-material"]').forEach((item) => {
    const itemEl = item as HTMLElement;
    const uuid = itemEl.dataset.uuid;

    itemEl.addEventListener('click', () => {
      if (!uuid) return;
      // Toggle selection - clicking selected item deselects it
      const newSelection = state.selectedMaterialId === uuid ? null : uuid;
      updateState({ selectedMaterialId: newSelection });
      rerender();
    });
  });

  // Color pickers
  container.querySelectorAll<HTMLInputElement>('.prop-color-input').forEach((input) => {
    input.addEventListener('input', () => {
      const property = input.dataset.property;
      const materialUuid = input.dataset.material;
      if (!property || !materialUuid) return;
      const hexValue = parseInt(input.value.replace('#', ''), 16);
      context.sendCommand({
        type: 'update-material-property',
        materialUuid,
        property,
        value: hexValue,
      });
    });
  });

  // Range sliders
  container.querySelectorAll<HTMLInputElement>('.prop-range-input').forEach((input) => {
    input.addEventListener('input', () => {
      const property = input.dataset.property;
      const materialUuid = input.dataset.material;
      if (!property || !materialUuid) return;
      const value = parseFloat(input.value);
      const valueDisplay = input.parentElement?.querySelector('.range-value');
      if (valueDisplay) {
        valueDisplay.textContent = value.toFixed(2);
      }
      context.sendCommand({
        type: 'update-material-property',
        materialUuid,
        property,
        value,
      });
    });
  });

  // Checkboxes
  container.querySelectorAll<HTMLInputElement>('.prop-checkbox-input').forEach((input) => {
    input.addEventListener('change', () => {
      const property = input.dataset.property;
      const materialUuid = input.dataset.material;
      if (!property || !materialUuid) return;
      context.sendCommand({
        type: 'update-material-property',
        materialUuid,
        property,
        value: input.checked,
      });
    });
  });

  // Select dropdowns
  container.querySelectorAll<HTMLSelectElement>('.prop-select-input').forEach((select) => {
    select.addEventListener('change', () => {
      const property = select.dataset.property;
      const materialUuid = select.dataset.material;
      if (!property || !materialUuid) return;
      const value = parseInt(select.value, 10);
      context.sendCommand({
        type: 'update-material-property',
        materialUuid,
        property,
        value,
      });
    });
  });
}

