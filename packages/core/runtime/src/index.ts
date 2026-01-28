/**
 * @3lens/runtime
 *
 * Public API for creating and managing Lens instances.
 *
 * @packageDocumentation
 */

// Core types
export * from './types';

// Lens creation
export { createLens, type LensConfig } from './lens';

// Context registration
export { type ContextRegistration, type ContextOptions } from './context';

// Host interface
export { type Host, type HostConfig } from './host';

// Client interface
export { type LensClient } from './client';

// Transport interface
export { type LensTransport, type TransportMessage } from './transport';

// Addon interface
export { type Addon, type AddonConfig, type AddonRequirements } from './addon';

// Doctor
export { type DoctorReport, type CapabilityStatus } from './doctor';

// Discovery
export {
  createContextDiscovery,
  type ContextDiscovery,
  type DiscoveryConfig,
  type DiscoveredContext,
  type DiscoveryEvent,
  type DiscoveryDoctorReport,
  DEFAULT_DISCOVERY_CONFIG,
} from './discovery';

// Version
export const RUNTIME_VERSION = '1.0.0';

// Re-export kernel types for convenience
export type { Fidelity, CaptureMode, Event, EventType } from '@3lens/kernel';
export type { EntityId, Node, Edge, NodeType, EdgeType, EntityGraph } from '@3lens/kernel';
