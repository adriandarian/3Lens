import type { DevtoolPlugin, DevtoolContext, PanelRenderContext } from '../types';

/**
 * Shadow casting light analysis
 */
export interface ShadowLightAnalysis {
  /**
   * Light UUID
   */
  uuid: string;

  /**
   * Light name
   */
  name: string;

  /**
   * Light type
   */
  type: 'DirectionalLight' | 'SpotLight' | 'PointLight';

  /**
   * Shadow map resolution
   */
  mapSize: { width: number; height: number };

  /**
   * Shadow camera near
   */
  near: number;

  /**
   * Shadow camera far
   */
  far: number;

  /**
   * Shadow bias
   */
  bias: number;

  /**
   * Normal bias
   */
  normalBias: number;

  /**
   * Shadow radius (for soft shadows)
   */
  radius: number;

  /**
   * Blur samples
   */
  blurSamples?: number;

  /**
   * For directional lights: frustum size
   */
  frustumSize?: { left: number; right: number; top: number; bottom: number };

  /**
   * For spot lights: angle and penumbra
   */
  spotSettings?: { angle: number; penumbra: number };

  /**
   * Estimated shadow map memory (bytes)
   */
  memoryUsage: number;

  /**
   * Number of objects casting shadows to this light
   */
  casterCount: number;

  /**
   * Number of objects receiving shadows
   */
  receiverCount: number;

  /**
   * Issues detected
   */
  issues: ShadowIssue[];
}

/**
 * Shadow issue types
 */
export interface ShadowIssue {
  type: 'high_resolution' | 'low_resolution' | 'large_frustum' | 'small_frustum' | 'high_bias' | 'low_bias' | 'too_many_casters' | 'no_receivers' | 'far_plane_too_far' | 'near_plane_too_close';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

/**
 * Shadow statistics
 */
export interface ShadowStats {
  /**
   * Total shadow map memory
   */
  totalMemory: number;

  /**
   * Number of shadow-casting lights
   */
  shadowLightCount: number;

  /**
   * Total shadow map pixels
   */
  totalPixels: number;

  /**
   * Number of shadow casters
   */
  totalCasters: number;

  /**
   * Number of shadow receivers
   */
  totalReceivers: number;

  /**
   * Average shadow map resolution
   */
  avgResolution: number;

  /**
   * Total issues found
   */
  issueCount: number;
}

/**
 * Shadow Debugger Plugin Settings
 */
export interface ShadowDebuggerSettings {
  /**
   * Max recommended shadow map resolution
   */
  maxRecommendedResolution: number;

  /**
   * Min recommended shadow map resolution
   */
  minRecommendedResolution: number;

  /**
   * Max recommended frustum size for directional lights
   */
  maxFrustumSize: number;

  /**
   * Max recommended casters per light
   */
  maxCastersPerLight: number;

  /**
   * Show shadow frustum visualization
   */
  showFrustumVis: boolean;

  /**
   * Highlight shadow map in viewport
   */
  showShadowMapPreview: boolean;
}

const DEFAULT_SETTINGS: ShadowDebuggerSettings = {
  maxRecommendedResolution: 2048,
  minRecommendedResolution: 256,
  maxFrustumSize: 100,
  maxCastersPerLight: 100,
  showFrustumVis: false,
  showShadowMapPreview: false,
};

/**
 * Shadow Map Debugger Plugin
 *
 * Analyzes shadow maps and shadow-casting lights to identify
 * performance issues and optimization opportunities.
 *
 * Features:
 * - Shadow map memory analysis
 * - Per-light configuration inspection
 * - Issue detection (bias, frustum, resolution)
 * - Caster/receiver counting
 * - Optimization suggestions
 */
export const ShadowDebuggerPlugin: DevtoolPlugin = {
  metadata: {
    id: '3lens.shadow-debugger',
    name: 'Shadow Debugger',
    version: '1.0.0',
    description: 'Analyzes shadow maps and lights to find performance issues',
    author: '3Lens Team',
    icon: '🔦',
    tags: ['performance', 'shadows', 'lighting', 'debug'],
  },

  settings: {
    fields: [
      {
        key: 'maxRecommendedResolution',
        label: 'Max Recommended Resolution',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.maxRecommendedResolution,
        description: 'Shadow maps above this are flagged',
        min: 512,
        max: 8192,
        step: 256,
      },
      {
        key: 'minRecommendedResolution',
        label: 'Min Recommended Resolution',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.minRecommendedResolution,
        description: 'Shadow maps below this are flagged',
        min: 64,
        max: 1024,
        step: 64,
      },
      {
        key: 'maxFrustumSize',
        label: 'Max Frustum Size',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.maxFrustumSize,
        description: 'Directional light frustum size warning threshold',
        min: 10,
        max: 500,
        step: 10,
      },
      {
        key: 'maxCastersPerLight',
        label: 'Max Casters Per Light',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.maxCastersPerLight,
        description: 'Warn if more than this many objects cast shadows',
        min: 10,
        max: 500,
        step: 10,
      },
      {
        key: 'showFrustumVis',
        label: 'Show Frustum Visualization',
        type: 'boolean',
        defaultValue: DEFAULT_SETTINGS.showFrustumVis,
        description: 'Draw shadow camera frustums in viewport',
      },
      {
        key: 'showShadowMapPreview',
        label: 'Show Shadow Map Preview',
        type: 'boolean',
        defaultValue: DEFAULT_SETTINGS.showShadowMapPreview,
        description: 'Show shadow map textures in corner of viewport',
      },
    ],
  },

  activate(context: DevtoolContext) {
    context.log('Shadow Debugger plugin activated');
    context.setState('lastAnalysis', null);
    context.setState('stats', null);
  },

  deactivate(context: DevtoolContext) {
    context.log('Shadow Debugger plugin deactivated');
  },

  panels: [
    {
      id: 'main',
      name: 'Shadow Analysis',
      icon: '🔦',
      order: 11,

      render(ctx: PanelRenderContext): string {
        const analysis = ctx.state.lastAnalysis as ShadowLightAnalysis[] | null;
        const stats = ctx.state.stats as ShadowStats | null;
        const stateSettings = (ctx.state.settings ?? {}) as Partial<ShadowDebuggerSettings>;
        const settings: ShadowDebuggerSettings = { ...DEFAULT_SETTINGS, ...stateSettings };

        if (!analysis) {
          return `
            <div class="shadow-debugger-panel">
              <div class="shadow-debugger-header">
                <span class="shadow-debugger-title">Shadow Analysis</span>
                <button class="shadow-debugger-btn primary" data-action="analyze">▶ Analyze Shadows</button>
              </div>
              <div class="shadow-debugger-empty">
                <p>Click "Analyze Shadows" to inspect shadow maps and lighting configuration.</p>
                <p class="shadow-debugger-hint">This will examine all shadow-casting lights and identify potential issues.</p>
              </div>
            </div>
          `;
        }

        const lightsWithIssues = analysis.filter(a => a.issues.length > 0);
        const errorCount = analysis.reduce((sum, a) => sum + a.issues.filter(i => i.severity === 'error').length, 0);
        const warningCount = analysis.reduce((sum, a) => sum + a.issues.filter(i => i.severity === 'warning').length, 0);

        return `
          <div class="shadow-debugger-panel">
            <div class="shadow-debugger-header">
              <span class="shadow-debugger-title">Shadow Analysis</span>
              <button class="shadow-debugger-btn" data-action="analyze">⟳ Re-analyze</button>
            </div>
            
            ${stats ? `
              <div class="shadow-debugger-summary">
                <div class="shadow-debugger-stat">
                  <span class="shadow-debugger-stat-value">${stats.shadowLightCount}</span>
                  <span class="shadow-debugger-stat-label">Shadow Lights</span>
                </div>
                <div class="shadow-debugger-stat">
                  <span class="shadow-debugger-stat-value">${formatBytes(stats.totalMemory)}</span>
                  <span class="shadow-debugger-stat-label">Shadow Memory</span>
                </div>
                <div class="shadow-debugger-stat">
                  <span class="shadow-debugger-stat-value">${stats.totalCasters}</span>
                  <span class="shadow-debugger-stat-label">Casters</span>
                </div>
                <div class="shadow-debugger-stat">
                  <span class="shadow-debugger-stat-value">${stats.totalReceivers}</span>
                  <span class="shadow-debugger-stat-label">Receivers</span>
                </div>
                <div class="shadow-debugger-stat ${errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : ''}">
                  <span class="shadow-debugger-stat-value">${stats.issueCount}</span>
                  <span class="shadow-debugger-stat-label">Issues</span>
                </div>
              </div>
            ` : ''}
            
            ${lightsWithIssues.length > 0 ? `
              <div class="shadow-debugger-section">
                <div class="shadow-debugger-section-header warning">⚠️ Lights with Issues (${lightsWithIssues.length})</div>
                <div class="shadow-debugger-list">
                  ${lightsWithIssues.map(a => renderLightAnalysis(a, settings)).join('')}
                </div>
              </div>
            ` : ''}
            
            ${analysis.length === 0 ? `
              <div class="shadow-debugger-info">
                ℹ️ No shadow-casting lights found in the scene.
              </div>
            ` : lightsWithIssues.length === 0 ? `
              <div class="shadow-debugger-success">
                ✓ All shadow configurations appear optimal.
              </div>
            ` : ''}
            
            ${analysis.length > 0 ? `
              <div class="shadow-debugger-section">
                <div class="shadow-debugger-section-header">All Shadow Lights (${analysis.length})</div>
                <div class="shadow-debugger-list">
                  ${analysis.map(a => renderLightAnalysis(a, settings)).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      },

      onMount(container: HTMLElement, context: DevtoolContext) {
        container.addEventListener('click', async (e) => {
          const action = (e.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action');
          if (action === 'analyze') {
            const stateSettings = (context.getAllState().settings ?? {}) as Partial<ShadowDebuggerSettings>;
            const settings: ShadowDebuggerSettings = { ...DEFAULT_SETTINGS, ...stateSettings };
            runShadowAnalysis(context, settings);
            context.requestRender();
          }

          const selectUuid = (e.target as HTMLElement).closest('[data-select-uuid]')?.getAttribute('data-select-uuid');
          if (selectUuid) {
            context.selectObject(selectUuid);
          }

          const toggleDetails = (e.target as HTMLElement).closest('[data-toggle-details]');
          if (toggleDetails) {
            toggleDetails.classList.toggle('expanded');
          }
        });
      },
    },
  ],
};

function runShadowAnalysis(context: DevtoolContext, settings: ShadowDebuggerSettings): void {
  const snapshot = context.getSnapshot();

  if (!snapshot) {
    context.setState('lastAnalysis', []);
    context.setState('stats', null);
    return;
  }

  const analysis: ShadowLightAnalysis[] = [];
  let totalCasters = 0;
  let totalReceivers = 0;

  // Count casters and receivers
  function countShadowObjects(node: Record<string, unknown>) {
    if (node.type === 'Mesh') {
      if (node.castShadow) totalCasters++;
      if (node.receiveShadow) totalReceivers++;
    }
    const children = node.children as Record<string, unknown>[] | undefined;
    if (children) {
      for (const child of children) {
        countShadowObjects(child);
      }
    }
  }

  // Find shadow-casting lights
  function findShadowLights(node: Record<string, unknown>) {
    const type = node.type as string;
    const castShadow = node.castShadow as boolean;

    if ((type === 'DirectionalLight' || type === 'SpotLight' || type === 'PointLight') && castShadow) {
      const shadow = node.shadow as Record<string, unknown> | undefined;
      if (shadow) {
        const mapSize = shadow.mapSize as { width: number; height: number } | undefined;
        const camera = shadow.camera as Record<string, unknown> | undefined;

        const width = mapSize?.width ?? 512;
        const height = mapSize?.height ?? 512;
        const near = (camera?.near as number) ?? 0.5;
        const far = (camera?.far as number) ?? 500;
        const bias = (shadow.bias as number) ?? 0;
        const normalBias = (shadow.normalBias as number) ?? 0;
        const radius = (shadow.radius as number) ?? 1;
        const blurSamples = shadow.blurSamples as number | undefined;

        // Calculate memory (depth texture, typically 32-bit)
        const memoryUsage = width * height * 4;

        // Detect issues
        const issues: ShadowIssue[] = [];

        // Resolution issues
        if (width > settings.maxRecommendedResolution || height > settings.maxRecommendedResolution) {
          issues.push({
            type: 'high_resolution',
            severity: 'warning',
            message: `Shadow map resolution (${width}x${height}) exceeds recommended maximum`,
            suggestion: `Consider reducing to ${settings.maxRecommendedResolution}x${settings.maxRecommendedResolution} or using CSM`,
          });
        }
        if (width < settings.minRecommendedResolution || height < settings.minRecommendedResolution) {
          issues.push({
            type: 'low_resolution',
            severity: 'info',
            message: `Shadow map resolution (${width}x${height}) is very low`,
            suggestion: 'This may cause visible shadow aliasing',
          });
        }

        // Bias issues
        if (Math.abs(bias) > 0.01) {
          issues.push({
            type: 'high_bias',
            severity: 'info',
            message: `Shadow bias (${bias}) is relatively high`,
            suggestion: 'High bias can cause peter-panning (shadows detaching from objects)',
          });
        }
        if (bias === 0 && normalBias === 0) {
          issues.push({
            type: 'low_bias',
            severity: 'info',
            message: 'No shadow bias set',
            suggestion: 'May cause shadow acne. Consider adding small bias (0.0001-0.001)',
          });
        }

        // Frustum issues for directional lights
        let frustumSize: ShadowLightAnalysis['frustumSize'];
        if (type === 'DirectionalLight' && camera) {
          const left = (camera.left as number) ?? -5;
          const right = (camera.right as number) ?? 5;
          const top = (camera.top as number) ?? 5;
          const bottom = (camera.bottom as number) ?? -5;
          frustumSize = { left, right, top, bottom };

          const frustumWidth = right - left;
          const frustumHeight = top - bottom;

          if (frustumWidth > settings.maxFrustumSize || frustumHeight > settings.maxFrustumSize) {
            issues.push({
              type: 'large_frustum',
              severity: 'warning',
              message: `Shadow frustum (${frustumWidth.toFixed(0)}x${frustumHeight.toFixed(0)}) is very large`,
              suggestion: 'Large frustums waste shadow map resolution. Consider CSM or tighter bounds.',
            });
          }

          // Check texels per unit
          const texelsPerUnit = width / frustumWidth;
          if (texelsPerUnit < 10) {
            issues.push({
              type: 'large_frustum',
              severity: 'warning',
              message: `Low shadow texel density (${texelsPerUnit.toFixed(1)} texels/unit)`,
              suggestion: 'Reduce frustum size or increase shadow map resolution',
            });
          }
        }

        // Spot light settings
        let spotSettings: ShadowLightAnalysis['spotSettings'];
        if (type === 'SpotLight') {
          spotSettings = {
            angle: (node.angle as number) ?? Math.PI / 3,
            penumbra: (node.penumbra as number) ?? 0,
          };
        }

        // Far plane issues
        if (far > 1000) {
          issues.push({
            type: 'far_plane_too_far',
            severity: 'info',
            message: `Shadow camera far plane (${far}) is very distant`,
            suggestion: 'Large depth range reduces shadow precision',
          });
        }

        analysis.push({
          uuid: String(node.uuid),
          name: String(node.name || 'unnamed'),
          type: type as 'DirectionalLight' | 'SpotLight' | 'PointLight',
          mapSize: { width, height },
          near,
          far,
          bias,
          normalBias,
          radius,
          blurSamples,
          frustumSize,
          spotSettings,
          memoryUsage,
          casterCount: totalCasters,
          receiverCount: totalReceivers,
          issues,
        });
      }
    }

    const children = node.children as Record<string, unknown>[] | undefined;
    if (children) {
      for (const child of children) {
        findShadowLights(child);
      }
    }
  }

  // First pass: count shadow casters/receivers
  for (const scene of snapshot.scenes) {
    countShadowObjects(scene as unknown as Record<string, unknown>);
  }

  // Check for too many casters
  if (totalCasters > settings.maxCastersPerLight) {
    // This is scene-wide, we'll add to each light
  }

  // Second pass: find shadow lights
  for (const scene of snapshot.scenes) {
    findShadowLights(scene as unknown as Record<string, unknown>);
  }

  // Add caster/receiver counts to each light and check for issues
  for (const light of analysis) {
    light.casterCount = totalCasters;
    light.receiverCount = totalReceivers;

    if (totalCasters > settings.maxCastersPerLight) {
      light.issues.push({
        type: 'too_many_casters',
        severity: 'warning',
        message: `${totalCasters} objects casting shadows`,
        suggestion: 'Consider reducing shadow casters or using shadow LOD',
      });
    }

    if (totalReceivers === 0) {
      light.issues.push({
        type: 'no_receivers',
        severity: 'info',
        message: 'No objects are receiving shadows',
        suggestion: 'Set receiveShadow=true on objects that should show shadows',
      });
    }
  }

  // Calculate stats
  const stats: ShadowStats = {
    totalMemory: analysis.reduce((sum, a) => sum + a.memoryUsage, 0),
    shadowLightCount: analysis.length,
    totalPixels: analysis.reduce((sum, a) => sum + a.mapSize.width * a.mapSize.height, 0),
    totalCasters,
    totalReceivers,
    avgResolution: analysis.length > 0 ? analysis.reduce((sum, a) => sum + a.mapSize.width, 0) / analysis.length : 0,
    issueCount: analysis.reduce((sum, a) => sum + a.issues.length, 0),
  };

  context.setState('lastAnalysis', analysis);
  context.setState('stats', stats);
}

function renderLightAnalysis(a: ShadowLightAnalysis, _settings: ShadowDebuggerSettings): string {
  const hasIssues = a.issues.length > 0;
  const errorCount = a.issues.filter(i => i.severity === 'error').length;
  const warningCount = a.issues.filter(i => i.severity === 'warning').length;
  const statusClass = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : '';

  const typeIcon = a.type === 'DirectionalLight' ? '☀️' : a.type === 'SpotLight' ? '🔦' : '💡';

  return `
    <div class="shadow-debugger-item ${statusClass}" data-toggle-details data-select-uuid="${a.uuid}">
      <div class="shadow-debugger-item-header">
        <span class="shadow-debugger-item-icon">${typeIcon}</span>
        <span class="shadow-debugger-item-name">${escapeHtml(a.name)}</span>
        <span class="shadow-debugger-item-type">${a.type.replace('Light', '')}</span>
        ${hasIssues ? `<span class="shadow-debugger-item-issues">${a.issues.length} issue${a.issues.length !== 1 ? 's' : ''}</span>` : ''}
      </div>
      <div class="shadow-debugger-item-stats">
        <span title="Shadow map size">📐 ${a.mapSize.width}x${a.mapSize.height}</span>
        <span title="Memory usage">💾 ${formatBytes(a.memoryUsage)}</span>
        <span title="Shadow camera range">📏 ${a.near.toFixed(1)}-${a.far.toFixed(0)}</span>
        <span title="Bias">⚖️ ${a.bias.toFixed(4)}</span>
      </div>
      ${hasIssues ? `
        <div class="shadow-debugger-item-issues-list">
          ${a.issues.map(issue => `
            <div class="shadow-debugger-issue ${issue.severity}">
              <span class="shadow-debugger-issue-icon">${issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <div class="shadow-debugger-issue-content">
                <div class="shadow-debugger-issue-message">${escapeHtml(issue.message)}</div>
                <div class="shadow-debugger-issue-suggestion">💡 ${escapeHtml(issue.suggestion)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export default ShadowDebuggerPlugin;

