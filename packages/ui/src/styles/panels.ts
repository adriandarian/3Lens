/**
 * Shared Panel Styles
 * Used by both overlay and extension
 */

export const PANEL_STYLES = `
/* ═══════════════════════════════════════════════════════════════
   SHARED PANEL STYLES
   ═══════════════════════════════════════════════════════════════ */

/* Empty State */
.panel-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  text-align: center;
  padding: 32px;
  color: var(--3lens-text-secondary);
}

.panel-empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.panel-empty-state h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  margin-bottom: 8px;
}

.panel-empty-state p {
  color: var(--3lens-text-secondary);
  max-width: 300px;
  margin: 0;
}

.panel-empty-state .hint {
  margin-top: 12px;
  font-size: 11px;
  color: var(--3lens-text-tertiary);
}

/* Split View Layout */
.panel-split-view {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.panel-list {
  flex: 1;
  min-width: 280px;
  overflow: auto;
  border-right: 1px solid var(--3lens-border);
}

.panel-inspector {
  width: 320px;
  min-width: 260px;
  max-width: 440px;
  overflow: auto;
  background: var(--3lens-bg-secondary);
}

/* Summary Bar */
.panel-summary {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(180deg, var(--3lens-bg-tertiary), var(--3lens-bg-secondary));
  border-bottom: 1px solid var(--3lens-border);
}

.summary-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-md);
  border: 1px solid var(--3lens-border-subtle);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-cyan);
}

.summary-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--3lens-text-tertiary);
  margin-top: 2px;
}

/* Search Bar */
.panel-search {
  position: relative;
  padding: 8px 12px;
  background: var(--3lens-bg-secondary);
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-md);
  color: var(--3lens-text-primary);
  font-size: 12px;
  font-family: var(--3lens-font-sans);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus {
  border-color: var(--3lens-accent-blue);
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.search-input::placeholder {
  color: var(--3lens-text-tertiary);
}

.search-clear {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  padding: 0;
  background: var(--3lens-bg-tertiary);
  border: none;
  border-radius: 50%;
  color: var(--3lens-text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}

.search-clear:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.no-results {
  padding: 24px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 12px;
}

/* List Items */
.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--3lens-radius-md);
  cursor: pointer;
  transition: all 120ms ease;
  margin: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid transparent;
}

.list-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
}

.list-item.selected {
  background: rgba(96, 165, 250, 0.15);
  border-color: var(--3lens-accent-blue);
  box-shadow: inset 3px 0 0 var(--3lens-accent-cyan);
}

/* No Selection State */
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--3lens-text-tertiary);
  text-align: center;
  padding: 24px;
}

.no-selection-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.no-selection-text {
  font-size: 12px;
}

/* Inspector Header */
.inspector-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(180deg, var(--3lens-bg-tertiary), var(--3lens-bg-secondary));
  border-bottom: 1px solid var(--3lens-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.inspector-header-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.inspector-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-subtitle {
  font-size: 11px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
}

.inspector-uuid {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
}

/* Inspector Sections */
.inspector-section {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.section-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
  margin-bottom: 8px;
}

/* Property Grid */
.property-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.property-label {
  color: var(--3lens-text-secondary);
}

.property-value {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  color: var(--3lens-text-primary);
  text-align: right;
}

.property-value.vector {
  color: var(--3lens-accent-cyan);
  font-size: 10px;
}

.property-value.type-badge {
  background: var(--3lens-bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.property-value.value-true {
  color: var(--3lens-accent-emerald);
}

.property-value.value-false {
  color: var(--3lens-text-tertiary);
}

.property-value.memory-value {
  color: var(--3lens-accent-pink);
  font-weight: 500;
}

/* Badges */
.badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge.shader {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.badge.transparent {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.badge.textures {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border);
}

.badge.cube {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.badge.compressed {
  background: rgba(251, 191, 36, 0.2);
  color: var(--3lens-accent-amber);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.video {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff;
}

/* Used By Section */
.used-by-section {
  padding: 12px;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.used-by-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.used-by-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}

.used-by-item:hover {
  background: var(--3lens-bg-hover);
}

.used-by-item .mesh-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-color-mesh);
  color: #000;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
}

.used-by-item .mesh-name {
  font-size: 12px;
  color: var(--3lens-text-primary);
}

.badge.rt {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border: 1px solid rgba(34, 211, 238, 0.3);
}

.badge.mip {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border);
}

/* Color Swatch */
.color-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.color-swatch.large {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
}

.color-swatch.no-color {
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══════════════════════════════════════════════════════════════
   EDITABLE CONTROLS
   ═══════════════════════════════════════════════════════════════ */

.property-value.editable {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Color Picker */
.prop-color-input {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}

.prop-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.prop-color-input::-webkit-color-swatch {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.color-hex {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-secondary);
}

/* Range Slider */
.prop-range-input {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--3lens-bg-primary);
  border-radius: 2px;
  cursor: pointer;
}

.prop-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--3lens-accent-cyan);
  cursor: pointer;
  border: 2px solid var(--3lens-bg-primary);
  box-shadow: 0 0 4px rgba(34, 211, 238, 0.4);
  transition: transform 100ms ease;
}

.prop-range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.prop-range-input.pbr-slider::-webkit-slider-thumb {
  background: linear-gradient(135deg, var(--3lens-accent-blue), var(--3lens-accent-cyan));
}

.prop-range-input.metalness::-webkit-slider-thumb {
  background: linear-gradient(135deg, var(--3lens-accent-amber), #fcd34d);
}

.range-value {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-secondary);
  min-width: 32px;
  text-align: right;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 18px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 18px;
  transition: all 150ms ease;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background: var(--3lens-text-tertiary);
  border-radius: 50%;
  transition: all 150ms ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: rgba(34, 211, 238, 0.2);
  border-color: var(--3lens-accent-cyan);
}

.toggle-switch input:checked + .toggle-slider::before {
  background: var(--3lens-accent-cyan);
  transform: translateX(14px);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

/* Select Dropdown */
.prop-select-input {
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border);
  border-radius: 4px;
  color: var(--3lens-text-primary);
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  padding: 4px 24px 4px 8px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath fill='%239ca3af' d='M1 2l3 3 3-3z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: all 100ms ease;
}

.prop-select-input:hover {
  border-color: var(--3lens-accent-cyan);
}

.prop-select-input:focus {
  outline: none;
  border-color: var(--3lens-accent-cyan);
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
}

/* ═══════════════════════════════════════════════════════════════
   MATERIALS PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.materials-split-view .panel-list {
  min-width: 280px;
}

.materials-split-view .panel-inspector {
  width: 320px;
}

.material-item.selected {
  background: rgba(251, 113, 133, 0.15);
  border-color: var(--3lens-accent-rose);
  box-shadow: inset 3px 0 0 var(--3lens-accent-rose);
}

.material-item-color .color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.material-item-info {
  flex: 1;
  min-width: 0;
}

.material-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-item-type {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.type-icon {
  font-size: 8px;
  opacity: 0.7;
}

.material-item-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.material-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Shader Section */
.shader-section {
  background: var(--3lens-bg-primary);
}

.shader-subsection {
  margin-top: 12px;
}

.shader-subsection:first-child {
  margin-top: 0;
}

.subsection-title {
  font-size: 10px;
  font-weight: 500;
  color: var(--3lens-text-secondary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.subsection-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--3lens-border-subtle);
}

/* Uniforms List */
.uniforms-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.uniform-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--3lens-bg-tertiary);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--3lens-font-mono);
}

.uniform-type {
  font-size: 9px;
  color: var(--3lens-accent-blue);
  background: rgba(96, 165, 250, 0.15);
  padding: 2px 4px;
  border-radius: 3px;
  min-width: 52px;
  text-align: center;
}

.uniform-name {
  color: var(--3lens-text-primary);
  flex: 1;
}

.uniform-value {
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Defines List */
.defines-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.define-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: var(--3lens-bg-tertiary);
  border-radius: 3px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.define-name {
  color: var(--3lens-accent-amber);
}

.define-value {
  color: var(--3lens-text-tertiary);
}

/* Shader Code */
.shader-code {
  background: #0d1117;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

.shader-code code {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: #c9d1d9;
  white-space: pre;
}

/* GLSL Syntax Highlighting */
.glsl-keyword { color: #ff7b72; font-weight: 500; }
.glsl-builtin { color: #d2a8ff; }
.glsl-builtin-var { color: #79c0ff; font-style: italic; }
.glsl-number { color: #a5d6ff; }
.glsl-string { color: #a5d6ff; }
.glsl-comment { color: #8b949e; font-style: italic; }
.glsl-preprocessor { color: #7ee787; }
.glsl-ident { color: #c9d1d9; }
.glsl-punct { color: #8b949e; }

/* Textures in materials */
.texture-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texture-list .texture-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
}

.texture-slot {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
  font-weight: 500;
  min-width: 100px;
}

.texture-uuid {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  font-size: 10px;
}

.texture-name {
  color: var(--3lens-text-secondary);
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══════════════════════════════════════════════════════════════
   GEOMETRY PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.geometry-split-view .panel-inspector {
  width: 340px;
  max-width: 480px;
}

.geometry-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.geometry-summary .summary-value {
  color: var(--3lens-accent-emerald);
}

.geometry-item.selected {
  background: rgba(52, 211, 153, 0.15);
  border-color: var(--3lens-accent-emerald);
  box-shadow: inset 3px 0 0 var(--3lens-accent-emerald);
}

.geometry-item-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--3lens-accent-emerald), #059669);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.geometry-item-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.geometry-item-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.geometry-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geometry-item-meta {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geometry-used-by {
  color: var(--3lens-text-secondary);
}

.geometry-item-stats {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.geo-stat-pill {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--3lens-font-mono);
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.geo-stat-pill.vertices {
  color: var(--3lens-accent-cyan);
  border-color: rgba(34, 211, 238, 0.3);
}

.geo-stat-pill.triangles {
  color: var(--3lens-accent-blue);
  border-color: rgba(96, 165, 250, 0.3);
}

.geo-stat-pill.memory {
  color: var(--3lens-accent-amber);
  border-color: rgba(251, 191, 36, 0.3);
}

.geo-stat-pill.usage {
  color: var(--3lens-text-secondary);
  border-color: var(--3lens-border);
}

.geometry-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Attributes Table */
.attributes-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.attributes-table th,
.attributes-table td {
  font-size: 11px;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--3lens-border-subtle);
}

.attributes-table th {
  font-weight: 500;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--3lens-bg-primary);
}

.attributes-table td {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-primary);
}

.attributes-table tr:hover {
  background: var(--3lens-bg-hover);
}

.attr-name {
  color: var(--3lens-accent-cyan);
  font-weight: 500;
}

.attr-type {
  color: var(--3lens-text-tertiary);
  font-size: 9px;
}

.attr-count {
  color: var(--3lens-text-secondary);
}

.attr-size {
  color: var(--3lens-accent-amber);
  text-align: right;
}

/* Bounding Box */
.bounding-box-viz {
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.bounding-box-viz .coord-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.bounding-box-viz .coord-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--3lens-text-tertiary);
  width: 40px;
}

.bounding-box-viz .coord-values {
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  color: var(--3lens-accent-cyan);
}

.bounding-box-viz .box-dimensions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--3lens-border-subtle);
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.bounding-box-viz .dim-value {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
}

/* Groups */
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--3lens-font-mono);
}

.group-item .group-range {
  color: var(--3lens-text-secondary);
}

.group-item .group-material {
  color: var(--3lens-accent-rose);
}

/* Morph Targets */
.morph-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.morph-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.morph-item .morph-name {
  color: #a78bfa;
}

.morph-item .morph-count {
  color: var(--3lens-text-tertiary);
}

/* Action Buttons */
.inspector-actions {
  display: flex;
  gap: 6px;
  padding: 12px;
  border-top: 1px solid var(--3lens-border);
  background: var(--3lens-bg-primary);
  position: sticky;
  bottom: 0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: 6px;
  color: var(--3lens-text-secondary);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 120ms ease;
}

.action-btn:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-text-primary);
}

.action-btn.active {
  background: rgba(34, 211, 238, 0.15);
  border-color: var(--3lens-accent-cyan);
  color: var(--3lens-accent-cyan);
}

.action-btn .btn-icon {
  font-size: 14px;
}

/* ═══════════════════════════════════════════════════════════════
   TEXTURES PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.textures-split-view .panel-list {
  min-width: 300px;
}

.textures-split-view .panel-inspector {
  width: 360px;
  max-width: 500px;
}

.textures-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.textures-summary .summary-value {
  color: var(--3lens-accent-pink);
}

.texture-item.selected {
  background: rgba(244, 114, 182, 0.15);
  border-color: var(--3lens-accent-pink);
  box-shadow: inset 3px 0 0 var(--3lens-accent-pink);
}

.texture-item-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.texture-thumb-placeholder {
  font-size: 18px;
  opacity: 0.7;
}

.texture-item-info {
  flex: 1;
  min-width: 0;
}

.texture-item-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.texture-item-meta {
  font-size: 10px;
  color: var(--3lens-text-tertiary);
  font-family: var(--3lens-font-mono);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.texture-item-badges {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.texture-item-stats {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tex-stat-pill {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: var(--3lens-font-mono);
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.tex-stat-pill.memory {
  color: var(--3lens-accent-pink);
  border-color: rgba(244, 114, 182, 0.3);
}

.texture-item-usage {
  font-size: 11px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  flex-shrink: 0;
  padding: 2px 6px;
  background: var(--3lens-bg-primary);
  border-radius: 3px;
}

/* Texture Header */
.texture-header-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--3lens-bg-primary);
  border: 1px solid var(--3lens-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.texture-header-placeholder {
  font-size: 24px;
  opacity: 0.7;
}

/* Texture Preview */
.texture-preview-section {
  background: var(--3lens-bg-primary);
}

.texture-preview-container {
  position: relative;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 16px 16px;
}

.texture-preview-img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;
}

/* Channel filters */
.texture-preview-img.channel-rgb { /* No filter */ }
.texture-preview-img.channel-r { filter: grayscale(100%) sepia(100%) hue-rotate(-30deg) saturate(300%); }
.texture-preview-img.channel-g { filter: grayscale(100%) sepia(100%) hue-rotate(70deg) saturate(300%); }
.texture-preview-img.channel-b { filter: grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%); }
.texture-preview-img.channel-a { filter: grayscale(100%); mix-blend-mode: luminosity; }

.texture-channel-toggles {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 2px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.channel-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.channel-btn:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.channel-btn.active {
  background: var(--3lens-accent-pink);
  color: #000;
}

/* Texture URL */
.texture-url {
  font-size: 9px;
  color: var(--3lens-accent-cyan);
  word-break: break-all;
  cursor: help;
}

/* Texture Flags */
.texture-flags {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.flag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border-subtle);
  opacity: 0.4;
}

.flag-item.enabled {
  opacity: 1;
  border-color: rgba(244, 114, 182, 0.3);
  background: rgba(244, 114, 182, 0.08);
}

.flag-icon {
  font-size: 14px;
}

.flag-label {
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.flag-item.enabled .flag-label {
  color: var(--3lens-text-primary);
}

/* Texture Usage */
.texture-usage-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.texture-usage-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 4px;
  font-size: 11px;
}

.usage-slot {
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-emerald);
  font-weight: 500;
  min-width: 100px;
}

.usage-material {
  color: var(--3lens-text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.usage-uuid {
  font-family: var(--3lens-font-mono);
  font-size: 10px;
  color: var(--3lens-text-tertiary);
}

.no-usage {
  font-size: 12px;
  color: var(--3lens-text-tertiary);
  font-style: italic;
  padding: 12px;
  text-align: center;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER TARGETS PANEL SPECIFIC
   ═══════════════════════════════════════════════════════════════ */

.render-targets-split-view .panel-list {
  min-width: 320px;
}

.render-targets-split-view .panel-inspector {
  width: 400px;
  max-width: 520px;
}

.render-targets-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}

.render-targets-summary .summary-value {
  color: var(--3lens-accent-cyan);
}

/* Render Target Grid Layout */
.render-targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  padding: 12px;
}

.rt-grid-item {
  background: var(--3lens-bg-tertiary);
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 120ms ease;
}

.rt-grid-item:hover {
  background: var(--3lens-bg-hover);
  border-color: var(--3lens-border);
  transform: translateY(-2px);
}

.rt-grid-item.selected {
  background: rgba(34, 211, 238, 0.12);
  border-color: var(--3lens-accent-cyan);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
}

.rt-grid-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 12px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rt-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.rt-thumb-placeholder {
  font-size: 28px;
  opacity: 0.6;
}

.rt-depth-indicator,
.rt-msaa-indicator {
  position: absolute;
  bottom: 4px;
  font-size: 9px;
  font-weight: 700;
  font-family: var(--3lens-font-mono);
  padding: 2px 5px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.7);
}

.rt-depth-indicator {
  left: 4px;
  color: var(--3lens-accent-emerald);
  border: 1px solid rgba(52, 211, 153, 0.4);
}

.rt-msaa-indicator {
  right: 4px;
  color: var(--3lens-accent-blue);
  border: 1px solid rgba(96, 165, 250, 0.4);
}

.rt-grid-info {
  padding: 10px;
}

.rt-grid-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--3lens-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.rt-grid-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.rt-dimensions {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.rt-usage-badge {
  font-size: 9px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  border: 1px solid var(--3lens-border-subtle);
}

.rt-usage-badge.shadow {
  background: rgba(30, 30, 30, 0.8);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}

.rt-usage-badge.postprocess {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border-color: rgba(139, 92, 246, 0.3);
}

.rt-usage-badge.reflection {
  background: rgba(96, 165, 250, 0.2);
  color: var(--3lens-accent-blue);
  border-color: rgba(96, 165, 250, 0.3);
}

.rt-usage-badge.refraction {
  background: rgba(34, 211, 238, 0.2);
  color: var(--3lens-accent-cyan);
  border-color: rgba(34, 211, 238, 0.3);
}

.rt-usage-badge.environment {
  background: rgba(52, 211, 153, 0.2);
  color: var(--3lens-accent-emerald);
  border-color: rgba(52, 211, 153, 0.3);
}

.rt-grid-stats {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rt-memory {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-accent-amber);
}

.rt-mrt-badge {
  font-size: 9px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  padding: 1px 4px;
  border-radius: 3px;
  background: rgba(244, 114, 182, 0.2);
  color: var(--3lens-accent-pink);
  border: 1px solid rgba(244, 114, 182, 0.3);
}

/* Render Target Header */
.rt-header-thumb {
  width: 56px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rt-header-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.rt-header-placeholder {
  font-size: 22px;
  opacity: 0.7;
}

/* Render Target Preview */
.rt-preview-section {
  background: var(--3lens-bg-primary);
}

.rt-preview-container {
  position: relative;
  border: 1px solid var(--3lens-border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: repeating-conic-gradient(#1f2937 0% 25%, #0f1419 0% 50%) 50% / 16px 16px;
}

.rt-preview-img {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;
  transform-origin: center;
  transition: transform 150ms ease;
}

/* Channel filters for render target preview */
.rt-preview-img.channel-color { /* No filter */ }
.rt-preview-img.channel-r { filter: grayscale(100%) sepia(100%) hue-rotate(-30deg) saturate(300%); }
.rt-preview-img.channel-g { filter: grayscale(100%) sepia(100%) hue-rotate(70deg) saturate(300%); }
.rt-preview-img.channel-b { filter: grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%); }
.rt-preview-img.channel-a { filter: grayscale(100%); mix-blend-mode: luminosity; }
.rt-preview-img.channel-depth { filter: grayscale(100%); }
.rt-preview-img.channel-heatmap { 
  filter: sepia(100%) saturate(500%) hue-rotate(-50deg);
}

.rt-preview-placeholder {
  padding: 40px;
  text-align: center;
  color: var(--3lens-text-tertiary);
  font-size: 12px;
}

.rt-preview-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: linear-gradient(transparent, rgba(10, 14, 20, 0.95));
}

.rt-channel-toggles {
  display: flex;
  gap: 2px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.rt-channel-toggles .channel-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--3lens-text-tertiary);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--3lens-font-mono);
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.rt-channel-toggles .channel-btn:hover {
  color: var(--3lens-text-secondary);
  background: var(--3lens-bg-hover);
}

.rt-channel-toggles .channel-btn.active {
  background: var(--3lens-accent-cyan);
  color: #000;
}

.rt-channel-toggles .channel-btn.depth.active {
  background: var(--3lens-accent-emerald);
}

.rt-channel-toggles .channel-btn.heatmap.active {
  background: linear-gradient(135deg, #ef4444, #f97316, #facc15);
  color: #000;
}

.channel-separator {
  width: 1px;
  height: 16px;
  background: var(--3lens-border);
  margin: 0 4px;
  align-self: center;
}

.rt-zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(10, 14, 20, 0.9);
  border-radius: 4px;
  padding: 2px;
}

.zoom-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--3lens-text-secondary);
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 100ms ease;
}

.zoom-btn:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.zoom-level {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
  min-width: 40px;
  text-align: center;
}

.rt-pixel-info {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 12px;
  background: rgba(10, 14, 20, 0.9);
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.pixel-coords {
  color: var(--3lens-accent-cyan);
}

.pixel-value {
  color: var(--3lens-text-secondary);
}

/* Render Target Buffers */
.rt-buffers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.rt-buffer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--3lens-bg-primary);
  border-radius: 6px;
  border: 1px solid var(--3lens-border-subtle);
  opacity: 0.4;
}

.rt-buffer-item.enabled {
  opacity: 1;
  border-color: rgba(34, 211, 238, 0.3);
  background: rgba(34, 211, 238, 0.06);
}

.rt-buffer-item.msaa {
  border-color: rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.08);
}

.buffer-icon {
  font-size: 14px;
}

.buffer-label {
  font-size: 11px;
  color: var(--3lens-text-secondary);
  flex: 1;
}

.rt-buffer-item.enabled .buffer-label {
  color: var(--3lens-text-primary);
}

.buffer-status {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-tertiary);
}

.rt-buffer-item.enabled .buffer-status {
  color: var(--3lens-accent-cyan);
}

/* MRT Section */
.mrt-value {
  color: var(--3lens-accent-pink);
  font-weight: 600;
}

.mrt-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.mrt-attachment {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(244, 114, 182, 0.1);
  border: 1px solid rgba(244, 114, 182, 0.2);
  border-radius: 4px;
}

.attachment-index {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--3lens-accent-pink);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  border-radius: 3px;
}

.attachment-format {
  font-size: 10px;
  font-family: var(--3lens-font-mono);
  color: var(--3lens-text-secondary);
}

/* Render Target Actions */
.rt-actions {
  flex-wrap: wrap;
}

.rt-actions .action-btn {
  min-width: 100px;
}

/* ═══════════════════════════════════════════════════════════════
   MATERIAL BUILDER PANEL (ARCHITECTURE)
   ═══════════════════════════════════════════════════════════════ */

.material-builder-panel {
  display: flex;
  flex: 1;
  min-height: 0;
}

.material-builder-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--3lens-border);
  background: radial-gradient(circle at top left, rgba(96, 165, 250, 0.08), transparent 55%);
}

.material-builder-canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--3lens-border);
  background: var(--3lens-bg-secondary);
}

.material-builder-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.material-builder-badge {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.2);
  color: var(--3lens-accent-blue);
}

.material-builder-actions {
  display: flex;
  gap: 8px;
}

.material-builder-action {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--3lens-border);
  background: var(--3lens-bg-primary);
  color: var(--3lens-text-secondary);
  font-size: 11px;
  cursor: not-allowed;
}

.material-builder-canvas-body {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.material-builder-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(transparent 23px, rgba(148, 163, 184, 0.12) 24px),
    linear-gradient(90deg, transparent 23px, rgba(148, 163, 184, 0.12) 24px);
  background-size: 24px 24px;
  pointer-events: none;
}

.material-builder-node {
  position: absolute;
  width: 190px;
  border-radius: 10px;
  border: 1px solid var(--3lens-border);
  background: var(--3lens-bg-tertiary);
  box-shadow: var(--3lens-shadow-sm);
}

.material-builder-node-header {
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  border-bottom: 1px solid var(--3lens-border);
  background: rgba(15, 23, 42, 0.6);
}

.material-builder-node-body {
  display: grid;
  gap: 6px;
  padding: 10px;
  font-size: 11px;
  color: var(--3lens-text-secondary);
}

.material-builder-port {
  display: flex;
  align-items: center;
  gap: 6px;
}

.material-builder-port::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--3lens-accent-cyan);
}

.material-builder-port.output::before {
  background: var(--3lens-accent-violet);
}

.material-builder-wire {
  position: absolute;
  left: 220px;
  top: 130px;
  width: 110px;
  height: 2px;
  background: linear-gradient(90deg, var(--3lens-accent-cyan), var(--3lens-accent-violet));
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.4);
}

.material-builder-inspector {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.material-builder-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--3lens-border-subtle);
  background: var(--3lens-bg-primary);
}

.material-builder-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--3lens-text-tertiary);
}

.material-builder-checklist {
  list-style: none;
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: var(--3lens-text-secondary);
}

.material-builder-checklist .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  background: var(--3lens-border);
}

.material-builder-checklist .dot.planned {
  background: var(--3lens-accent-amber);
}

.material-builder-placeholder {
  color: var(--3lens-text-tertiary);
  font-size: 12px;
}

.material-builder-output {
  display: grid;
  gap: 8px;
  font-size: 12px;
}

.material-builder-output-row {
  display: flex;
  justify-content: space-between;
  color: var(--3lens-text-secondary);
}

/* ═══════════════════════════════════════════════════════════════
   SCROLLBAR
   ═══════════════════════════════════════════════════════════════ */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--3lens-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--3lens-text-tertiary);
}
`;
