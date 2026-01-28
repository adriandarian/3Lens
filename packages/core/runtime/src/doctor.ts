/**
 * Doctor - Diagnostics and Troubleshooting
 *
 * @packageDocumentation
 */

import type { Fidelity } from '@3lens/kernel';
import type { Backend, SupportTier } from './types';

/**
 * Doctor report
 */
export interface DoctorReport {
  /** Environment summary */
  environment: EnvironmentSummary;
  /** Capability matrix */
  capability_matrix: Record<string, CapabilityStatus>;
  /** Actionable fixes */
  actionable_fixes: ActionableFix[];
  /** Warnings */
  warnings: string[];
}

/**
 * Environment summary
 */
export interface EnvironmentSummary {
  /** three.js version */
  three_version: string;
  /** Support tier */
  three_tier: SupportTier;
  /** Backend type */
  backend: Backend;
  /** Is worker environment */
  is_worker: boolean;
  /** CSP restrictions detected */
  csp_restrictions: string[];
  /** Capability summary */
  capabilities: Record<string, boolean>;
}

/**
 * Capability status
 */
export interface CapabilityStatus {
  /** Whether available */
  available: boolean;
  /** Fidelity level */
  fidelity: Fidelity;
  /** Reason if not available */
  reason?: string;
}

/**
 * Actionable fix
 */
export interface ActionableFix {
  /** Issue description */
  issue: string;
  /** Fix description */
  fix: string;
  /** Severity */
  severity: 'error' | 'warning' | 'info';
  /** Code snippet if applicable */
  code?: string;
}

/**
 * Run doctor diagnostics
 */
export function runDoctor(): DoctorReport {
  const environment = detectEnvironment();
  const capabilities = detectCapabilities(environment);
  const fixes = generateFixes(environment, capabilities);
  const warnings = generateWarnings(environment, capabilities);

  return {
    environment,
    capability_matrix: capabilities,
    actionable_fixes: fixes,
    warnings,
  };
}

/**
 * Detect environment
 */
function detectEnvironment(): EnvironmentSummary {
  // Detect three.js
  const threeVersion = detectThreeVersion();
  const threeTier = getThreeTier(threeVersion);

  // Detect backend
  const backend = detectBackend();

  // Detect worker
  const isWorker = typeof WorkerGlobalScope !== 'undefined';

  // Detect CSP
  const cspRestrictions = detectCSPRestrictions();

  return {
    three_version: threeVersion,
    three_tier: threeTier,
    backend,
    is_worker: isWorker,
    csp_restrictions: cspRestrictions,
    capabilities: {},
  };
}

/**
 * Detect three.js version
 */
function detectThreeVersion(): string {
  // Try global THREE
  if (typeof (globalThis as any).THREE !== 'undefined') {
    return (globalThis as any).THREE.REVISION ?? 'unknown';
  }
  return 'unknown';
}

/**
 * Get three.js support tier
 */
function getThreeTier(version: string): SupportTier {
  if (version === 'unknown') return 'UNKNOWN';

  // Parse revision number
  const rev = parseInt(version, 10);
  if (isNaN(rev)) return 'UNKNOWN';

  // Define supported range (last 6 revisions as example)
  const SUPPORTED_MIN = 150;
  const COMPATIBLE_MIN = 140;

  if (rev >= SUPPORTED_MIN) return 'SUPPORTED';
  if (rev >= COMPATIBLE_MIN) return 'COMPATIBLE';
  return 'UNKNOWN';
}

/**
 * Detect rendering backend
 */
function detectBackend(): Backend {
  // Check for WebGPU
  if (typeof (navigator as any).gpu !== 'undefined') {
    return 'webgpu';
  }

  // Check WebGL version
  try {
    const canvas = document.createElement('canvas');
    if (canvas.getContext('webgl2')) {
      return 'webgl2';
    }
    if (canvas.getContext('webgl')) {
      return 'webgl1';
    }
  } catch {
    // Ignore errors in non-browser environments
  }

  return 'webgl2'; // Default assumption
}

/**
 * Detect CSP restrictions
 */
function detectCSPRestrictions(): string[] {
  const restrictions: string[] = [];

  // Check inline styles
  try {
    const el = document.createElement('div');
    el.style.color = 'red';
    if (el.style.color !== 'red') {
      restrictions.push('inline-styles');
    }
  } catch {
    restrictions.push('inline-styles');
  }

  // Check eval
  try {
    new Function('return true')();
  } catch {
    restrictions.push('eval');
  }

  return restrictions;
}

/**
 * Detect capabilities
 */
function detectCapabilities(env: EnvironmentSummary): Record<string, CapabilityStatus> {
  const caps: Record<string, CapabilityStatus> = {};

  // Render events
  caps['capture.renderEvents'] = {
    available: true,
    fidelity: 'EXACT',
  };

  // Resource lifecycle
  caps['capture.resourceLifecycle'] = {
    available: true,
    fidelity: 'EXACT',
  };

  // Pass boundaries
  caps['capture.passBoundaries'] = {
    available: env.backend === 'webgpu',
    fidelity: env.backend === 'webgpu' ? 'EXACT' : 'ESTIMATED',
    reason: env.backend !== 'webgpu' ? 'Pass boundaries are explicit in WebGPU only' : undefined,
  };

  // CPU timing
  caps['timing.cpu'] = {
    available: true,
    fidelity: 'EXACT',
  };

  // GPU timing
  caps['timing.gpu'] = {
    available: env.backend !== 'webgl1',
    fidelity: env.backend === 'webgpu' ? 'EXACT' : 'ESTIMATED',
    reason: env.backend === 'webgl1' ? 'GPU timing not available in WebGL1' : undefined,
  };

  // Shader introspection
  caps['introspection.shaderSource'] = {
    available: true,
    fidelity: 'EXACT',
  };

  // Pipeline introspection
  caps['introspection.pipeline'] = {
    available: env.backend === 'webgpu',
    fidelity: env.backend === 'webgpu' ? 'EXACT' : 'UNAVAILABLE',
    reason: env.backend !== 'webgpu' ? 'Pipeline objects are WebGPU-only' : undefined,
  };

  // Style injection
  caps['ui.styleInjection'] = {
    available: !env.csp_restrictions.includes('inline-styles'),
    fidelity: 'EXACT',
    reason: env.csp_restrictions.includes('inline-styles') ? 'CSP blocks inline styles' : undefined,
  };

  return caps;
}

/**
 * Generate actionable fixes
 */
function generateFixes(
  env: EnvironmentSummary,
  caps: Record<string, CapabilityStatus>
): ActionableFix[] {
  const fixes: ActionableFix[] = [];

  // Unknown three.js version
  if (env.three_tier === 'UNKNOWN') {
    fixes.push({
      issue: 'three.js version could not be detected or is unsupported',
      fix: 'Upgrade to three.js r150 or later for full support',
      severity: 'warning',
    });
  }

  // CSP inline styles blocked
  if (!caps['ui.styleInjection']?.available) {
    fixes.push({
      issue: 'CSP blocks inline style injection',
      fix: 'Use CSP-safe mode with external CSS',
      severity: 'warning',
      code: `createLens({ csp: { cssUrl: '/path/to/3lens.css' } })`,
    });
  }

  // WebGL1 limited
  if (env.backend === 'webgl1') {
    fixes.push({
      issue: 'WebGL1 has limited capabilities',
      fix: 'Consider upgrading to WebGL2 or WebGPU for better introspection',
      severity: 'info',
    });
  }

  return fixes;
}

/**
 * Generate warnings
 */
function generateWarnings(
  env: EnvironmentSummary,
  caps: Record<string, CapabilityStatus>
): string[] {
  const warnings: string[] = [];

  // Check for degraded capabilities
  for (const [name, status] of Object.entries(caps)) {
    if (status.fidelity === 'ESTIMATED') {
      warnings.push(`${name}: Running in estimated mode (${status.reason})`);
    } else if (!status.available) {
      warnings.push(`${name}: Unavailable (${status.reason})`);
    }
  }

  return warnings;
}

/**
 * Export doctor report to JSON
 */
export function exportDoctorReport(report: DoctorReport): string {
  return JSON.stringify(report, null, 2);
}
