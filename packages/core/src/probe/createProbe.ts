import type { ProbeConfig } from '../types';
import { DevtoolProbe } from './DevtoolProbe';
import { createPostMessageTransport } from '../transport/postmessage-transport';

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
  const probe = new DevtoolProbe(config);

  // Auto-connect to browser extension via postMessage transport
  // This enables the Chrome extension to work without manual setup
  if (
    typeof window !== 'undefined' &&
    typeof window.postMessage === 'function'
  ) {
    const transport = createPostMessageTransport();
    probe.connect(transport);
  }

  return probe;
}
