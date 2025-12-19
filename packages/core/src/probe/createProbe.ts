import type { ProbeConfig } from '../types';
import { DevtoolProbe } from './DevtoolProbe';

/**
 * Create a new DevtoolProbe instance
 *
 * @param config - Probe configuration
 * @returns A new DevtoolProbe instance
 *
 * @example
 * ```typescript
 * import { createProbe } from '@3lens/core';
 *
 * const probe = createProbe({
 *   appName: 'My Three.js App',
 *   rules: {
 *     maxDrawCalls: 1000,
 *     maxTriangles: 500000,
 *   },
 * });
 *
 * probe.observeRenderer(renderer);
 * probe.observeScene(scene);
 * ```
 */
export function createProbe(config: ProbeConfig): DevtoolProbe {
  return new DevtoolProbe(config);
}

