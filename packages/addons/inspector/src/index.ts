/**
 * @3lens/addon-inspector
 *
 * Inspector addon - the SPINE of 3Lens.
 * Entity browser + blame navigator answering the 5 questions.
 *
 * @packageDocumentation
 */

import type { Addon, Lens } from '@3lens/runtime';
import type { EntityId, Node, Edge, EntityGraph, Fidelity } from '@3lens/kernel';

export * from './inspector';
export * from './questions';
export * from './panel';

/**
 * Inspector addon definition
 */
export const inspectorAddon: Addon = {
  id: 'com.3lens.addon-inspector',
  version: '1.0.0',
  displayName: 'Inspector',
  description: 'Entity browser and blame navigator - the SPINE of 3Lens',

  requires: {
    kernel: '^1.0.0',
    trace: '^1.0.0',
  },

  capabilities: {
    required: ['capture.renderEvents'],
    optional: ['introspection.shaderSource', 'timing.gpu'],
  },

  register(lens: Lens) {
    console.log('[3Lens] Inspector addon registered');

    // Register queries
    registerInspectorQueries(lens);

    // Register panel
    // TODO: registerPanel when UI core is ready
  },

  unregister(lens: Lens) {
    console.log('[3Lens] Inspector addon unregistered');
  },
};

/**
 * Register inspector-specific queries
 */
function registerInspectorQueries(lens: Lens) {
  // These will be registered once query system is fully wired
}

export default inspectorAddon;
