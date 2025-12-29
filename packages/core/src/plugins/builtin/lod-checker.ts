import type { DevtoolPlugin, DevtoolContext, PanelRenderContext } from '../types';

/**
 * LOD (Level of Detail) Analysis Result
 */
export interface LODAnalysis {
  /**
   * Object UUID
   */
  uuid: string;

  /**
   * Object name
   */
  name: string;

  /**
   * Triangle count
   */
  triangles: number;

  /**
   * Distance from camera
   */
  distance: number;

  /**
   * Screen space size (approximate pixels)
   */
  screenSize: number;

  /**
   * Triangles per screen pixel
   */
  trianglesPerPixel: number;

  /**
   * Suggested LOD level (0 = highest detail, 3 = lowest)
   */
  suggestedLOD: number;

  /**
   * Is this object potentially over-detailed for its screen size?
   */
  isOverDetailed: boolean;

  /**
   * Is this object too far to be visible?
   */
  isTooFar: boolean;

  /**
   * Has LOD system
   */
  hasLOD: boolean;

  /**
   * Current LOD level (if using LOD)
   */
  currentLOD?: number;
}

/**
 * LOD Checker Plugin Settings
 */
export interface LODCheckerSettings {
  /**
   * Threshold for triangles per pixel to consider over-detailed
   */
  overDetailThreshold: number;

  /**
   * Minimum screen size (pixels) to consider visible
   */
  minScreenSize: number;

  /**
   * Maximum distance to consider for analysis
   */
  maxAnalysisDistance: number;

  /**
   * Show overlay markers on over-detailed objects
   */
  showOverlayMarkers: boolean;

  /**
   * Auto-refresh interval (ms), 0 to disable
   */
  autoRefreshInterval: number;
}

const DEFAULT_SETTINGS: LODCheckerSettings = {
  overDetailThreshold: 10, // 10+ triangles per pixel is likely over-detailed
  minScreenSize: 5, // Objects smaller than 5px are effectively invisible
  maxAnalysisDistance: 1000,
  showOverlayMarkers: false,
  autoRefreshInterval: 0,
};

/**
 * LOD Checker Plugin
 *
 * Analyzes mesh complexity relative to screen space coverage to identify
 * opportunities for LOD optimization.
 *
 * Features:
 * - Per-object triangle density analysis
 * - Screen space coverage calculation
 * - Over-detailed object detection
 * - LOD recommendations
 * - Distance-based visibility analysis
 */
export const LODCheckerPlugin: DevtoolPlugin = {
  metadata: {
    id: '3lens.lod-checker',
    name: 'LOD Checker',
    version: '1.0.0',
    description: 'Analyzes mesh complexity vs screen coverage to find LOD optimization opportunities',
    author: '3Lens Team',
    icon: '🔍',
    tags: ['performance', 'optimization', 'lod', 'mesh'],
  },

  settings: {
    fields: [
      {
        key: 'overDetailThreshold',
        label: 'Over-Detail Threshold',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.overDetailThreshold,
        description: 'Triangles per pixel to flag as over-detailed',
        min: 1,
        max: 100,
        step: 1,
      },
      {
        key: 'minScreenSize',
        label: 'Min Screen Size (px)',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.minScreenSize,
        description: 'Objects smaller than this are flagged as too small',
        min: 1,
        max: 50,
        step: 1,
      },
      {
        key: 'maxAnalysisDistance',
        label: 'Max Analysis Distance',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.maxAnalysisDistance,
        description: 'Maximum distance from camera to analyze',
        min: 10,
        max: 10000,
        step: 10,
      },
      {
        key: 'showOverlayMarkers',
        label: 'Show Overlay Markers',
        type: 'boolean',
        defaultValue: DEFAULT_SETTINGS.showOverlayMarkers,
        description: 'Highlight over-detailed objects in the viewport',
      },
      {
        key: 'autoRefreshInterval',
        label: 'Auto-Refresh (ms)',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.autoRefreshInterval,
        description: '0 to disable auto-refresh',
        min: 0,
        max: 10000,
        step: 100,
      },
    ],
  },

  activate(context: DevtoolContext) {
    context.log('LOD Checker plugin activated');
    context.setState('lastAnalysis', null);
    context.setState('analysisTime', 0);
  },

  deactivate(context: DevtoolContext) {
    context.log('LOD Checker plugin deactivated');
    const intervalId = context.getState<number>('intervalId');
    if (intervalId) {
      clearInterval(intervalId);
    }
  },

  onSettingsChange(settings: Record<string, unknown>, context: DevtoolContext) {
    const intervalId = context.getState<number>('intervalId');
    if (intervalId) {
      clearInterval(intervalId);
    }

    const interval = settings.autoRefreshInterval as number;
    if (interval > 0) {
      const newIntervalId = window.setInterval(() => {
        runAnalysis(context, settings as unknown as LODCheckerSettings);
      }, interval);
      context.setState('intervalId', newIntervalId);
    }
  },

  panels: [
    {
      id: 'main',
      name: 'LOD Analysis',
      icon: '🔍',
      order: 10,

      render(ctx: PanelRenderContext): string {
        const analysis = ctx.state.lastAnalysis as LODAnalysis[] | null;
        const analysisTime = ctx.state.analysisTime as number || 0;
        const settings = { ...DEFAULT_SETTINGS, ...(ctx.state.settings ?? {}) } as LODCheckerSettings;

        if (!analysis) {
          return `
            <div class="lod-checker-panel">
              <div class="lod-checker-header">
                <span class="lod-checker-title">LOD Analysis</span>
                <button class="lod-checker-btn primary" data-action="analyze">▶ Run Analysis</button>
              </div>
              <div class="lod-checker-empty">
                <p>Click "Run Analysis" to analyze mesh complexity in the current scene.</p>
                <p class="lod-checker-hint">This will calculate triangle density relative to screen coverage for all visible meshes.</p>
              </div>
            </div>
          `;
        }

        const overDetailed = analysis.filter(a => a.isOverDetailed);
        const tooFar = analysis.filter(a => a.isTooFar);
        const withLOD = analysis.filter(a => a.hasLOD);
        const totalTriangles = analysis.reduce((sum, a) => sum + a.triangles, 0);

        return `
          <div class="lod-checker-panel">
            <div class="lod-checker-header">
              <span class="lod-checker-title">LOD Analysis</span>
              <button class="lod-checker-btn" data-action="analyze">⟳ Re-run</button>
            </div>
            
            <div class="lod-checker-summary">
              <div class="lod-checker-stat">
                <span class="lod-checker-stat-value">${analysis.length}</span>
                <span class="lod-checker-stat-label">Meshes</span>
              </div>
              <div class="lod-checker-stat">
                <span class="lod-checker-stat-value">${formatNumber(totalTriangles)}</span>
                <span class="lod-checker-stat-label">Total Tris</span>
              </div>
              <div class="lod-checker-stat ${overDetailed.length > 0 ? 'warning' : ''}">
                <span class="lod-checker-stat-value">${overDetailed.length}</span>
                <span class="lod-checker-stat-label">Over-detailed</span>
              </div>
              <div class="lod-checker-stat ${tooFar.length > 0 ? 'info' : ''}">
                <span class="lod-checker-stat-value">${tooFar.length}</span>
                <span class="lod-checker-stat-label">Too Far</span>
              </div>
              <div class="lod-checker-stat">
                <span class="lod-checker-stat-value">${withLOD.length}</span>
                <span class="lod-checker-stat-label">Has LOD</span>
              </div>
            </div>
            
            <div class="lod-checker-analysis-time">Analysis took ${analysisTime.toFixed(1)}ms</div>
            
            ${overDetailed.length > 0 ? `
              <div class="lod-checker-section">
                <div class="lod-checker-section-header warning">⚠️ Over-Detailed Objects (${overDetailed.length})</div>
                <div class="lod-checker-section-desc">These objects have more triangles than needed for their screen size.</div>
                <div class="lod-checker-list">
                  ${overDetailed.slice(0, 20).map(a => renderAnalysisItem(a, settings)).join('')}
                  ${overDetailed.length > 20 ? `<div class="lod-checker-more">...and ${overDetailed.length - 20} more</div>` : ''}
                </div>
              </div>
            ` : ''}
            
            ${tooFar.length > 0 ? `
              <div class="lod-checker-section">
                <div class="lod-checker-section-header info">📍 Distant/Tiny Objects (${tooFar.length})</div>
                <div class="lod-checker-section-desc">These objects are very small on screen and may not need to be rendered.</div>
                <div class="lod-checker-list">
                  ${tooFar.slice(0, 10).map(a => renderAnalysisItem(a, settings)).join('')}
                  ${tooFar.length > 10 ? `<div class="lod-checker-more">...and ${tooFar.length - 10} more</div>` : ''}
                </div>
              </div>
            ` : ''}
            
            ${overDetailed.length === 0 && tooFar.length === 0 ? `
              <div class="lod-checker-success">
                ✓ All meshes appear to be appropriately detailed for their screen coverage.
              </div>
            ` : ''}
            
            <div class="lod-checker-section">
              <div class="lod-checker-section-header">All Analyzed Objects (${analysis.length})</div>
              <div class="lod-checker-list scrollable">
                ${analysis.slice(0, 50).map(a => renderAnalysisItem(a, settings)).join('')}
                ${analysis.length > 50 ? `<div class="lod-checker-more">...and ${analysis.length - 50} more</div>` : ''}
              </div>
            </div>
          </div>
        `;
      },

      onMount(container: HTMLElement, context: DevtoolContext) {
        container.addEventListener('click', async (e) => {
          const action = (e.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action');
          if (action === 'analyze') {
            const settings = { ...DEFAULT_SETTINGS, ...context.getAllState().settings } as LODCheckerSettings;
            await runAnalysis(context, settings);
            context.requestRender();
          }

          const selectUuid = (e.target as HTMLElement).closest('[data-select-uuid]')?.getAttribute('data-select-uuid');
          if (selectUuid) {
            context.selectObject(selectUuid);
          }
        });
      },
    },
  ],
};

function runAnalysis(context: DevtoolContext, settings: LODCheckerSettings): void {
  const startTime = performance.now();
  const snapshot = context.getSnapshot();

  if (!snapshot) {
    context.setState('lastAnalysis', []);
    context.setState('analysisTime', 0);
    return;
  }

  const analysis: LODAnalysis[] = [];

  // Get camera info for distance calculations
  const stats = context.getFrameStats();
  const cameraPosition = stats?.camera?.position ?? { x: 0, y: 0, z: 0 };

  // Traverse all scenes and collect mesh data
  function traverse(node: { ref: { type: string; uuid: string; name?: string; debugId: string }; children: typeof node[] }) {
    // Check if this is a mesh with geometry
    const ref = node.ref as unknown as Record<string, unknown>;
    if (ref.type === 'Mesh' && ref.geometry) {
      const geometry = ref.geometry as Record<string, unknown>;
      const position = (ref.position ?? { x: 0, y: 0, z: 0 }) as { x: number; y: number; z: number };

      // Calculate distance from camera
      const dx = position.x - cameraPosition.x;
      const dy = position.y - cameraPosition.y;
      const dz = position.z - cameraPosition.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance > settings.maxAnalysisDistance) {
        return; // Skip objects beyond max distance
      }

      // Get triangle count
      const index = geometry.index as { count: number } | null;
      const positionAttr = (geometry.attributes as Record<string, { count: number }> | undefined)?.position;
      let triangles = 0;
      if (index) {
        triangles = Math.floor(index.count / 3);
      } else if (positionAttr) {
        triangles = Math.floor(positionAttr.count / 3);
      }

      // Estimate screen size based on bounding sphere and distance
      const boundingSphere = geometry.boundingSphere as { radius: number } | null;
      const radius = boundingSphere?.radius ?? 1;
      const fov = 60; // Assume 60 degree FOV
      const screenHeight = 1080; // Assume 1080p
      const angularSize = 2 * Math.atan(radius / Math.max(distance, 0.1));
      const screenSize = (angularSize / (fov * Math.PI / 180)) * screenHeight;

      // Calculate triangles per pixel
      const screenArea = Math.PI * (screenSize / 2) ** 2;
      const trianglesPerPixel = screenArea > 0 ? triangles / screenArea : 0;

      // Determine suggested LOD
      let suggestedLOD = 0;
      if (trianglesPerPixel > 50) suggestedLOD = 3;
      else if (trianglesPerPixel > 20) suggestedLOD = 2;
      else if (trianglesPerPixel > settings.overDetailThreshold) suggestedLOD = 1;

      // Check if object has LOD
      const parent = ref.parent as { type?: string } | undefined;
      const hasLOD = parent?.type === 'LOD';

      analysis.push({
        uuid: String(ref.uuid),
        name: String(ref.name || 'unnamed'),
        triangles,
        distance,
        screenSize,
        trianglesPerPixel,
        suggestedLOD,
        isOverDetailed: trianglesPerPixel > settings.overDetailThreshold && triangles > 100,
        isTooFar: screenSize < settings.minScreenSize && triangles > 50,
        hasLOD,
        currentLOD: hasLOD ? 0 : undefined,
      });
    }

    // Recurse into children
    for (const child of node.children) {
      traverse(child);
    }
  }

  for (const scene of snapshot.scenes) {
    traverse(scene as unknown as Parameters<typeof traverse>[0]);
  }

  // Sort by triangles per pixel (most over-detailed first)
  analysis.sort((a, b) => b.trianglesPerPixel - a.trianglesPerPixel);

  const endTime = performance.now();
  context.setState('lastAnalysis', analysis);
  context.setState('analysisTime', endTime - startTime);
}

function renderAnalysisItem(a: LODAnalysis, _settings: LODCheckerSettings): string {
  const statusClass = a.isOverDetailed ? 'warning' : a.isTooFar ? 'info' : '';
  const lodBadge = a.hasLOD ? '<span class="lod-checker-badge lod">LOD</span>' : '';
  const overBadge = a.isOverDetailed ? '<span class="lod-checker-badge over">OVER</span>' : '';
  const farBadge = a.isTooFar ? '<span class="lod-checker-badge far">FAR</span>' : '';

  return `
    <div class="lod-checker-item ${statusClass}" data-select-uuid="${a.uuid}">
      <div class="lod-checker-item-header">
        <span class="lod-checker-item-name">${escapeHtml(a.name)}</span>
        <span class="lod-checker-item-badges">${lodBadge}${overBadge}${farBadge}</span>
      </div>
      <div class="lod-checker-item-stats">
        <span title="Triangle count">▲ ${formatNumber(a.triangles)}</span>
        <span title="Distance from camera">📏 ${a.distance.toFixed(1)}</span>
        <span title="Screen size (px)">📐 ${a.screenSize.toFixed(0)}px</span>
        <span title="Triangles per pixel" class="${a.trianglesPerPixel > 10 ? 'highlight' : ''}">${a.trianglesPerPixel.toFixed(1)} tri/px</span>
      </div>
      ${a.suggestedLOD > 0 ? `<div class="lod-checker-item-suggestion">💡 Consider LOD ${a.suggestedLOD} at this distance</div>` : ''}
    </div>
  `;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export default LODCheckerPlugin;

