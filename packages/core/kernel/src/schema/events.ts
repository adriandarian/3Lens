/**
 * 3Lens Event Schema
 *
 * This file defines all event types that flow through the capture system.
 * Events are the source of truth for what happened during rendering.
 *
 * @packageDocumentation
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Fidelity level for data quality indication
 */
export type Fidelity = 'EXACT' | 'ESTIMATED' | 'UNAVAILABLE';

/**
 * Capture mode affecting event detail level
 */
export type CaptureMode = 'MINIMAL' | 'STANDARD' | 'DEEP';

/**
 * Base interface for all events
 */
export interface BaseEvent {
  /** Event type discriminator */
  type: string;
  /** Context this event belongs to */
  context_id: string;
  /** Monotonic sequence number within context */
  seq: number;
  /** High-resolution timestamp (performance.now()) */
  timestamp: number;
}

// =============================================================================
// Context Events
// =============================================================================

/**
 * Emitted when a new context is registered
 */
export interface ContextRegisterEvent extends BaseEvent {
  type: 'context_register';
  /** Human-readable display name */
  display_name: string;
  /** Renderer entity ID */
  renderer_id: string;
  /** Primary scene entity ID */
  scene_id: string;
  /** Primary camera entity ID */
  camera_id: string;
  /** Backend type */
  backend: 'webgl1' | 'webgl2' | 'webgpu';
  /** Discovery method */
  discovery: 'manual' | 'observe' | 'hook';
  /** Fidelity of discovery */
  discovery_fidelity: Fidelity;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Emitted when context metadata is updated
 */
export interface ContextUpdateEvent extends BaseEvent {
  type: 'context_update';
  /** Fields that changed */
  changes: Partial<{
    display_name: string;
    scene_id: string;
    camera_id: string;
    metadata: Record<string, unknown>;
  }>;
}

/**
 * Emitted when a context is unregistered/destroyed
 */
export interface ContextUnregisterEvent extends BaseEvent {
  type: 'context_unregister';
  /** Reason for unregistration */
  reason: 'dispose' | 'detach' | 'error';
}

/**
 * Emitted when 3Lens attaches to an already-running application
 */
export interface AttachPointEvent extends BaseEvent {
  type: 'attach_point';
  /** Frame number at attach time (if known) */
  frame?: number;
  /** Entities that existed before attach */
  preexisting_count: number;
}

// =============================================================================
// Rendering Events
// =============================================================================

/**
 * Emitted when a frame begins (if detectable)
 */
export interface FrameBeginEvent extends BaseEvent {
  type: 'frame_begin';
  /** Frame number */
  frame: number;
  /** Whether frame boundaries are EXACT or ESTIMATED */
  fidelity: Fidelity;
}

/**
 * Emitted when a frame ends (if detectable)
 */
export interface FrameEndEvent extends BaseEvent {
  type: 'frame_end';
  /** Frame number */
  frame: number;
  /** Frame duration in ms (if measurable) */
  duration_ms?: number;
  /** Duration fidelity */
  duration_fidelity?: Fidelity;
}

/**
 * Emitted for every render() call
 */
export interface RenderEvent extends BaseEvent {
  type: 'render_event';
  /** Frame this render belongs to */
  frame: number;
  /** Scene being rendered */
  scene_id: string;
  /** Camera being used */
  camera_id: string;
  /** Render target (null for default framebuffer) */
  render_target_id?: string;
  /** Pass identifier (if pipeline is registered) */
  pass_id?: string;
  /** Draw call count */
  draw_calls?: number;
  /** Triangle count */
  triangles?: number;
  /** Fidelity of metrics */
  metrics_fidelity?: Fidelity;
}

/**
 * Emitted when a pass begins (DEEP mode or instrumented)
 */
export interface PassBeginEvent extends BaseEvent {
  type: 'pass_begin';
  /** Pass identifier */
  pass_id: string;
  /** Pass name */
  pass_name: string;
  /** Frame number */
  frame: number;
  /** Pass tags */
  tags: PassTag[];
}

/**
 * Emitted when a pass ends
 */
export interface PassEndEvent extends BaseEvent {
  type: 'pass_end';
  /** Pass identifier */
  pass_id: string;
  /** Frame number */
  frame: number;
  /** Pass duration in ms */
  duration_ms?: number;
  /** Duration fidelity */
  duration_fidelity?: Fidelity;
}

export type PassTag = 'main' | 'shadow' | 'probe' | 'post' | 'ui' | 'mrt' | 'custom';

// =============================================================================
// Resource Events
// =============================================================================

/**
 * Emitted when a resource is created
 */
export interface ResourceCreateEvent extends BaseEvent {
  type: 'resource_create';
  /** Entity ID for this resource */
  entity_id: string;
  /** Resource type */
  resource_type: ResourceType;
  /** Origin of resource */
  origin: 'created' | 'preexisting';
  /** Estimated memory footprint in bytes */
  memory_bytes?: number;
  /** Memory fidelity */
  memory_fidelity?: Fidelity;
  /** Resource-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Emitted when a resource is updated/modified
 */
export interface ResourceUpdateEvent extends BaseEvent {
  type: 'resource_update';
  /** Entity ID for this resource */
  entity_id: string;
  /** What changed */
  changes: string[];
  /** Memory delta in bytes */
  memory_delta?: number;
  /** Delta fidelity */
  memory_fidelity?: Fidelity;
}

/**
 * Emitted when a resource is disposed
 */
export interface ResourceDisposeEvent extends BaseEvent {
  type: 'resource_dispose';
  /** Entity ID for this resource */
  entity_id: string;
  /** Reason for disposal */
  reason: 'explicit' | 'gc' | 'context_lost' | 'unknown';
  /** Lifetime in frames */
  lifetime_frames?: number;
}

export type ResourceType =
  | 'geometry'
  | 'material'
  | 'texture'
  | 'render_target'
  | 'shader'
  | 'shader_variant'
  | 'buffer'
  | 'sampler';

// =============================================================================
// Object Events
// =============================================================================

/**
 * Emitted when an Object3D is added to the scene graph
 */
export interface ObjectAddedEvent extends BaseEvent {
  type: 'object_added';
  /** Entity ID */
  entity_id: string;
  /** Object type (Mesh, Light, Group, etc.) */
  object_type: string;
  /** Parent entity ID */
  parent_id: string;
  /** Object name (if set) */
  name?: string;
}

/**
 * Emitted when an Object3D is removed from the scene graph
 */
export interface ObjectRemovedEvent extends BaseEvent {
  type: 'object_removed';
  /** Entity ID */
  entity_id: string;
  /** Parent entity ID it was removed from */
  parent_id: string;
}

/**
 * Emitted when an Object3D property changes (DEEP mode only)
 */
export interface ObjectUpdateEvent extends BaseEvent {
  type: 'object_update';
  /** Entity ID */
  entity_id: string;
  /** Properties that changed */
  changes: string[];
}

// =============================================================================
// Shader Events
// =============================================================================

/**
 * Emitted when a shader program/variant is compiled
 */
export interface ShaderCompileEvent extends BaseEvent {
  type: 'shader_compile';
  /** Shader entity ID */
  shader_id: string;
  /** Variant entity ID */
  variant_id: string;
  /** Material that triggered compilation */
  material_id?: string;
  /** Defines that created this variant */
  defines: string[];
  /** Compilation time in ms */
  compile_time_ms?: number;
  /** Fidelity of timing */
  timing_fidelity?: Fidelity;
}

/**
 * Emitted when shader compilation fails
 */
export interface ShaderErrorEvent extends BaseEvent {
  type: 'shader_error';
  /** Shader entity ID */
  shader_id: string;
  /** Error message */
  error: string;
  /** Shader stage */
  stage: 'vertex' | 'fragment' | 'compute';
}

// =============================================================================
// Diagnostic Events
// =============================================================================

/**
 * Warning event for non-fatal issues
 */
export interface WarningEvent extends BaseEvent {
  type: 'warning_event';
  /** Warning category */
  category: WarningCategory;
  /** Warning message */
  message: string;
  /** Additional details */
  details?: Record<string, unknown>;
}

export type WarningCategory =
  | 'hook_disabled'
  | 'csp_blocked'
  | 'degraded_mode'
  | 'version_mismatch'
  | 'capability_unavailable'
  | 'buffer_pressure'
  | 'custom';

/**
 * Error event for fatal issues
 */
export interface ErrorEvent extends BaseEvent {
  type: 'error_event';
  /** Error category */
  category: ErrorCategory;
  /** Error message */
  message: string;
  /** Stack trace if available */
  stack?: string;
}

export type ErrorCategory =
  | 'hook_failure'
  | 'context_lost'
  | 'transport_error'
  | 'validation_error'
  | 'custom';

// =============================================================================
// Union Type
// =============================================================================

/**
 * Union of all event types
 */
export type Event =
  // Context
  | ContextRegisterEvent
  | ContextUpdateEvent
  | ContextUnregisterEvent
  | AttachPointEvent
  // Rendering
  | FrameBeginEvent
  | FrameEndEvent
  | RenderEvent
  | PassBeginEvent
  | PassEndEvent
  // Resources
  | ResourceCreateEvent
  | ResourceUpdateEvent
  | ResourceDisposeEvent
  // Objects
  | ObjectAddedEvent
  | ObjectRemovedEvent
  | ObjectUpdateEvent
  // Shaders
  | ShaderCompileEvent
  | ShaderErrorEvent
  // Diagnostics
  | WarningEvent
  | ErrorEvent;

/**
 * Event type discriminator
 */
export type EventType = Event['type'];

// =============================================================================
// Event Utilities
// =============================================================================

/**
 * Check if an event is a resource event
 */
export function isResourceEvent(
  event: Event
): event is ResourceCreateEvent | ResourceUpdateEvent | ResourceDisposeEvent {
  return (
    event.type === 'resource_create' ||
    event.type === 'resource_update' ||
    event.type === 'resource_dispose'
  );
}

/**
 * Check if an event is a rendering event
 */
export function isRenderingEvent(
  event: Event
): event is FrameBeginEvent | FrameEndEvent | RenderEvent | PassBeginEvent | PassEndEvent {
  return (
    event.type === 'frame_begin' ||
    event.type === 'frame_end' ||
    event.type === 'render_event' ||
    event.type === 'pass_begin' ||
    event.type === 'pass_end'
  );
}

/**
 * Check if an event is a diagnostic event
 */
export function isDiagnosticEvent(event: Event): event is WarningEvent | ErrorEvent {
  return event.type === 'warning_event' || event.type === 'error_event';
}
