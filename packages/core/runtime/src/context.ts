/**
 * Context Registration
 *
 * @packageDocumentation
 */

import type { Fidelity } from '@3lens/kernel';
import type { Host } from './host';
import type { Backend, DiscoveryMode } from './types';

/**
 * Context registration
 */
export interface ContextRegistration {
  /** Unique context ID */
  id: string;
  /** Host for this context */
  host: Host;
  /** Display name */
  displayName?: string;
  /** Additional scenes to track */
  scenes?: unknown[];
  /** Additional cameras to track */
  cameras?: unknown[];
  /** Pipeline descriptor */
  pipeline?: PipelineDescriptor;
}

/**
 * Context options for registration
 */
export interface ContextOptions {
  /** Context ID (auto-generated if not provided) */
  id?: string;
  /** Display name */
  displayName?: string;
  /** Discovery fidelity */
  discoveryFidelity?: Fidelity;
}

/**
 * Context info (internal state)
 */
export interface ContextInfo {
  /** Context ID */
  id: string;
  /** Display name */
  displayName: string;
  /** Discovery method */
  discovery: DiscoveryMode;
  /** Discovery fidelity */
  discoveryFidelity: Fidelity;
  /** Backend */
  backend: Backend;
  /** Whether context is active */
  active: boolean;
  /** Host reference */
  host: Host;
}

/**
 * Pipeline descriptor for custom render pipelines
 */
export interface PipelineDescriptor {
  /** Pipeline ID */
  id: string;
  /** Display name */
  displayName: string;
  /** Pass definitions */
  passes: PassDescriptor[];
  /** Pass ordering edges */
  edges?: [string, string][];
}

/**
 * Pass descriptor
 */
export interface PassDescriptor {
  /** Pass ID */
  id: string;
  /** Pass name */
  name: string;
  /** Pass tags */
  tags?: ('main' | 'shadow' | 'probe' | 'post' | 'ui' | 'mrt' | 'custom')[];
}

/**
 * Generate a context ID
 */
export function generateContextId(): string {
  return `ctx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
