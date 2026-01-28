/**
 * Inspector Panel
 *
 * UI panel for entity inspection.
 *
 * @packageDocumentation
 */

import type { Panel, PanelConfig } from '@3lens/ui-core';
import type { LensClient, Selection } from '@3lens/runtime';
import type { EntityId } from '@3lens/kernel';
import type { InspectionResult } from './questions';
import { inspectEntity, type InspectorContext } from './questions';

/**
 * Create the inspector panel
 */
export function createInspectorPanel(client: LensClient): Panel {
  let container: HTMLElement | null = null;
  let currentSelection: Selection | null = null;

  return {
    id: 'inspector',
    name: 'Inspector',

    render(target: HTMLElement, lensClient: LensClient) {
      container = target;
      renderInspector(container, currentSelection, lensClient);
    },

    onSelectionChange(selection: Selection) {
      currentSelection = selection;
      if (container) {
        renderInspector(container, selection, client);
      }
    },

    dispose() {
      container = null;
      currentSelection = null;
    },
  };
}

/**
 * Render the inspector content
 */
function renderInspector(
  container: HTMLElement,
  selection: Selection | null,
  client: LensClient
): void {
  if (!selection || selection.entity_ids.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  // Single selection
  if (selection.entity_ids.length === 1) {
    const entityId = selection.entity_ids[0];
    const context: InspectorContext = {
      graph: client.getGraph(),
    };

    const result = inspectEntity(entityId, context);
    if (!result) {
      container.innerHTML = renderNotFound(entityId);
      return;
    }

    container.innerHTML = renderEntityInspection(result);
    return;
  }

  // Multi-selection
  container.innerHTML = renderMultiSelection(selection.entity_ids, client);
}

/**
 * Render empty state
 */
function renderEmptyState(): string {
  return `
    <div class="inspector-empty">
      <div class="inspector-empty-icon">🔍</div>
      <div class="inspector-empty-title">No Selection</div>
      <div class="inspector-empty-hint">
        Select an entity in the scene or from another panel to inspect it.
      </div>
    </div>
  `;
}

/**
 * Render not found state
 */
function renderNotFound(entityId: EntityId): string {
  return `
    <div class="inspector-empty">
      <div class="inspector-empty-icon">❓</div>
      <div class="inspector-empty-title">Entity Not Found</div>
      <div class="inspector-empty-hint">
        Entity <code>${entityId}</code> could not be found in the graph.
      </div>
    </div>
  `;
}

/**
 * Render entity inspection (all 5 questions)
 */
function renderEntityInspection(result: InspectionResult): string {
  const { identity, relationships, cost, changes, actions, fidelity } = result;

  return `
    <div class="inspector-content">
      <!-- Header -->
      <div class="inspector-header">
        <div class="inspector-type-badge">${identity.type}</div>
        <div class="inspector-name">${identity.name}</div>
        <div class="inspector-id">${identity.id}</div>
        ${renderFidelityBadge(fidelity)}
      </div>

      <!-- Q1: What is this? -->
      <section class="inspector-section">
        <h3 class="inspector-section-title">Identity</h3>
        <div class="inspector-properties">
          <div class="inspector-property">
            <span class="property-key">Type:</span>
            <span class="property-value">${identity.type}</span>
          </div>
          <div class="inspector-property">
            <span class="property-key">Context:</span>
            <span class="property-value">${identity.context_id}</span>
          </div>
          <div class="inspector-property">
            <span class="property-key">Origin:</span>
            <span class="property-value">${identity.origin}</span>
          </div>
          <div class="inspector-property">
            <span class="property-key">Active:</span>
            <span class="property-value">${identity.active ? 'Yes' : 'No'}</span>
          </div>
          ${renderProperties(identity.properties)}
        </div>
      </section>

      <!-- Q2: Where is it used? -->
      <section class="inspector-section">
        <h3 class="inspector-section-title">
          Relationships
          <span class="section-count">${relationships.usage_summary.incoming_count + relationships.usage_summary.outgoing_count}</span>
        </h3>
        ${renderRelationships(relationships)}
      </section>

      <!-- Q3: What does it cost? -->
      <section class="inspector-section">
        <h3 class="inspector-section-title">Cost</h3>
        ${renderCost(cost)}
      </section>

      <!-- Q4: How did it change? -->
      <section class="inspector-section">
        <h3 class="inspector-section-title">Changes</h3>
        ${renderChanges(changes)}
      </section>

      <!-- Q5: What can I do? -->
      <section class="inspector-section">
        <h3 class="inspector-section-title">Actions</h3>
        ${renderActions(actions)}
      </section>
    </div>
  `;
}

/**
 * Render multi-selection view
 */
function renderMultiSelection(entityIds: EntityId[], client: LensClient): string {
  return `
    <div class="inspector-content">
      <div class="inspector-header">
        <div class="inspector-name">${entityIds.length} Entities Selected</div>
      </div>
      <div class="inspector-multi-list">
        ${entityIds
          .map(
            (id) => `
          <div class="inspector-multi-item" data-entity-id="${id}">
            <span class="multi-item-id">${id}</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

/**
 * Render fidelity badge
 */
function renderFidelityBadge(fidelity: string): string {
  const colors: Record<string, string> = {
    EXACT: '#4caf50',
    ESTIMATED: '#ff9800',
    UNAVAILABLE: '#9e9e9e',
  };

  return `
    <div class="fidelity-badge" style="background: ${colors[fidelity] ?? colors.UNAVAILABLE}">
      ${fidelity}
    </div>
  `;
}

/**
 * Render properties
 */
function renderProperties(properties: Record<string, unknown>): string {
  return Object.entries(properties)
    .map(
      ([key, value]) => `
      <div class="inspector-property">
        <span class="property-key">${key}:</span>
        <span class="property-value">${formatValue(value)}</span>
      </div>
    `
    )
    .join('');
}

/**
 * Render relationships
 */
function renderRelationships(relationships: import('./inspector').RelationshipInfo): string {
  if (relationships.incoming.length === 0 && relationships.outgoing.length === 0) {
    return '<div class="inspector-empty-section">No relationships</div>';
  }

  let html = '';

  if (relationships.incoming.length > 0) {
    html += `
      <div class="relationship-group">
        <div class="relationship-group-title">Used by (${relationships.incoming.length})</div>
        ${relationships.incoming
          .slice(0, 10)
          .map(
            (edge) => `
          <div class="relationship-item">
            <span class="relationship-type">${edge.type}</span>
            <span class="relationship-entity">${edge.entity_name ?? edge.entity_id}</span>
          </div>
        `
          )
          .join('')}
        ${relationships.incoming.length > 10 ? `<div class="relationship-more">+${relationships.incoming.length - 10} more</div>` : ''}
      </div>
    `;
  }

  if (relationships.outgoing.length > 0) {
    html += `
      <div class="relationship-group">
        <div class="relationship-group-title">Uses (${relationships.outgoing.length})</div>
        ${relationships.outgoing
          .slice(0, 10)
          .map(
            (edge) => `
          <div class="relationship-item">
            <span class="relationship-type">${edge.type}</span>
            <span class="relationship-entity">${edge.entity_name ?? edge.entity_id}</span>
          </div>
        `
          )
          .join('')}
        ${relationships.outgoing.length > 10 ? `<div class="relationship-more">+${relationships.outgoing.length - 10} more</div>` : ''}
      </div>
    `;
  }

  return html;
}

/**
 * Render cost metrics
 */
function renderCost(cost: import('./inspector').CostInfo): string {
  const metrics = [];

  if (cost.gpu_time) {
    metrics.push(renderMetric('GPU Time', cost.gpu_time));
  }
  if (cost.cpu_time) {
    metrics.push(renderMetric('CPU Time', cost.cpu_time));
  }
  if (cost.memory_bytes) {
    metrics.push(renderMetric('Memory', cost.memory_bytes));
  }
  if (cost.draw_calls) {
    metrics.push(renderMetric('Draw Calls', cost.draw_calls));
  }
  if (cost.triangles) {
    metrics.push(renderMetric('Triangles', cost.triangles));
  }
  if (cost.variant_count) {
    metrics.push(renderMetric('Variants', cost.variant_count));
  }

  if (metrics.length === 0) {
    return '<div class="inspector-empty-section">No cost data available</div>';
  }

  return `<div class="cost-metrics">${metrics.join('')}</div>`;
}

/**
 * Render a single metric
 */
function renderMetric(name: string, metric: import('./inspector').MetricValue): string {
  return `
    <div class="cost-metric">
      <span class="metric-name">${name}</span>
      <span class="metric-value">${formatMetricValue(metric.value, metric.unit)}</span>
      ${renderFidelityBadge(metric.fidelity)}
    </div>
  `;
}

/**
 * Render changes
 */
function renderChanges(changes: import('./inspector').ChangeInfo): string {
  if (changes.recent_changes.length === 0) {
    return '<div class="inspector-empty-section">No recent changes</div>';
  }

  return `
    <div class="changes-list">
      ${changes.recent_changes
        .map(
          (change) => `
        <div class="change-item">
          <span class="change-type">${change.type}</span>
          <span class="change-frame">Frame ${change.frame}</span>
          ${change.changes ? `<span class="change-details">${change.changes.join(', ')}</span>` : ''}
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

/**
 * Render actions
 */
function renderActions(actionsInfo: import('./inspector').ActionInfo): string {
  return `
    <div class="actions-list">
      ${actionsInfo.actions
        .map(
          (action) => `
        <button 
          class="action-button ${action.available ? '' : 'disabled'}" 
          data-action="${action.id}"
          title="${action.description}"
          ${action.available ? '' : 'disabled'}
        >
          ${action.name}
        </button>
      `
        )
        .join('')}
    </div>
  `;
}

/**
 * Format a value for display
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string') return value.length > 50 ? value.slice(0, 50) + '...' : value;
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === 'object') return '{...}';
  return String(value);
}

/**
 * Format a metric value
 */
function formatMetricValue(value: number, unit: string): string {
  if (unit === 'bytes') {
    if (value > 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    if (value > 1024) return `${(value / 1024).toFixed(2)} KB`;
    return `${value} B`;
  }
  if (unit === 'ms') {
    if (value < 1) return `${(value * 1000).toFixed(2)} μs`;
    return `${value.toFixed(2)} ms`;
  }
  return `${value.toLocaleString()} ${unit}`;
}
