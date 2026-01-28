/**
 * 3Lens Trace Format Schema
 *
 * This file defines the trace file format including headers, chunks,
 * and export/import capabilities.
 *
 * @packageDocumentation
 */

import type { Event, Fidelity, CaptureMode } from './events';
import type { GraphSnapshot, Node, Edge } from './entity-graph';

// =============================================================================
// Version Info
// =============================================================================

/**
 * Current trace format version
 */
export const TRACE_VERSION = '1.0.0';

/**
 * Minimum compatible trace version
 */
export const MIN_COMPATIBLE_VERSION = '1.0.0';

// =============================================================================
// Trace Structure
// =============================================================================

/**
 * Complete trace file structure
 */
export interface Trace {
  /** Trace header with metadata */
  header: TraceHeader;
  /** String dictionary for compression */
  dictionary: TraceDictionary;
  /** Entity graph snapshots */
  snapshots: TraceSnapshot[];
  /** Event chunks */
  events: TraceEventChunk[];
  /** Index for random access (optional) */
  index?: TraceIndex;
}

// =============================================================================
// Header
// =============================================================================

/**
 * Trace header containing metadata
 */
export interface TraceHeader {
  /** Trace format version */
  version: string;
  /** 3Lens kernel version that created this trace */
  kernel_version: string;
  /** When this trace was created */
  created_at: string; // ISO 8601
  /** Session ID */
  session_id: string;
  /** Export profile used */
  export_profile: ExportProfile;
  /** Environment info */
  environment: TraceEnvironment;
  /** Contexts included in this trace */
  contexts: TraceContextInfo[];
  /** Capture mode used */
  capture_mode: CaptureMode;
  /** Time range covered */
  time_range: {
    start: number;
    end: number;
  };
  /** Frame range covered */
  frame_range: {
    start: number;
    end: number;
  };
  /** Statistics */
  stats: TraceStats;
}

/**
 * Environment information
 */
export interface TraceEnvironment {
  /** three.js version */
  three_version: string;
  /** Support tier */
  three_tier: 'SUPPORTED' | 'COMPATIBLE' | 'UNKNOWN';
  /** Backend type */
  backend: 'webgl1' | 'webgl2' | 'webgpu';
  /** Browser info */
  browser?: string;
  /** User agent */
  user_agent?: string;
  /** Was this a worker environment? */
  is_worker: boolean;
  /** CSP restrictions detected */
  csp_restrictions: string[];
  /** Capability matrix */
  capabilities: Record<string, { available: boolean; fidelity: Fidelity }>;
}

/**
 * Context information in trace
 */
export interface TraceContextInfo {
  /** Context ID */
  id: string;
  /** Display name */
  display_name: string;
  /** Discovery method */
  discovery: 'manual' | 'observe' | 'hook';
  /** Discovery fidelity */
  discovery_fidelity: Fidelity;
  /** Backend for this context */
  backend: 'webgl1' | 'webgl2' | 'webgpu';
}

/**
 * Trace statistics
 */
export interface TraceStats {
  /** Total event count */
  event_count: number;
  /** Events by type */
  events_by_type: Record<string, number>;
  /** Node count */
  node_count: number;
  /** Nodes by type */
  nodes_by_type: Record<string, number>;
  /** Edge count */
  edge_count: number;
  /** Frame count */
  frame_count: number;
  /** Snapshot count */
  snapshot_count: number;
  /** Chunk count */
  chunk_count: number;
  /** Compressed size in bytes */
  compressed_bytes: number;
  /** Uncompressed size in bytes */
  uncompressed_bytes: number;
}

// =============================================================================
// Dictionary
// =============================================================================

/**
 * String dictionary for compression
 * Maps indices to commonly used strings
 */
export interface TraceDictionary {
  /** String table */
  strings: string[];
  /** Entity ID table */
  entity_ids: string[];
  /** Property key table */
  property_keys: string[];
  /** Event type table */
  event_types: string[];
}

// =============================================================================
// Snapshots
// =============================================================================

/**
 * Entity graph snapshot within trace
 */
export interface TraceSnapshot {
  /** Snapshot timestamp */
  timestamp: number;
  /** Frame number at snapshot time */
  frame: number;
  /** Sequence number at snapshot time */
  seq: number;
  /** Graph snapshot data */
  graph: GraphSnapshot;
  /** Is this the initial snapshot? */
  is_initial: boolean;
  /** Contexts included */
  context_ids: string[];
}

// =============================================================================
// Event Chunks
// =============================================================================

/**
 * Chunk of events
 */
export interface TraceEventChunk {
  /** Chunk index */
  index: number;
  /** Time range covered by this chunk */
  time_range: {
    start: number;
    end: number;
  };
  /** Sequence range */
  seq_range: {
    start: number;
    end: number;
  };
  /** Frame range */
  frame_range?: {
    start: number;
    end: number;
  };
  /** Events in this chunk (may be compressed) */
  events: Event[];
  /** Whether this chunk is compressed */
  compressed: boolean;
  /** Compression method if compressed */
  compression?: 'delta' | 'gzip' | 'dictionary';
  /** Raw compressed data if compressed */
  compressed_data?: Uint8Array;
}

// =============================================================================
// Index
// =============================================================================

/**
 * Index for random access into trace
 */
export interface TraceIndex {
  /** Snapshot offsets by frame */
  snapshots: Array<{
    frame: number;
    offset: number;
  }>;
  /** Event chunk offsets by time */
  chunks: Array<{
    time_start: number;
    time_end: number;
    offset: number;
  }>;
  /** Frame index */
  frames: Array<{
    frame: number;
    chunk_index: number;
    event_offset: number;
  }>;
}

// =============================================================================
// Export Profiles
// =============================================================================

export type ExportProfile = 'MINIMAL' | 'STANDARD' | 'FULL' | 'FULL_REDACTED';

/**
 * Export options
 */
export interface ExportOptions {
  /** Export profile */
  profile: ExportProfile;
  /** Time range to export (undefined = all) */
  time_range?: [number, number];
  /** Contexts to export (undefined = all) */
  contexts?: string[];
  /** Redaction options (for FULL_REDACTED) */
  redaction?: RedactionOptions;
  /** Include index? */
  include_index?: boolean;
  /** Compression level (0-9) */
  compression_level?: number;
}

/**
 * Redaction options for sensitive data
 */
export interface RedactionOptions {
  /** Hash URLs and file paths */
  hash_urls: boolean;
  /** Hash asset/file names */
  hash_asset_names: boolean;
  /** Remove shader source code */
  remove_shader_source: boolean;
  /** Remove custom properties */
  remove_custom_properties: boolean;
  /** Custom redaction function */
  custom_redactor?: (key: string, value: unknown) => unknown;
}

// =============================================================================
// Profile Specifications
// =============================================================================

/**
 * What each export profile includes
 */
export const EXPORT_PROFILE_SPECS: Record<
  ExportProfile,
  {
    description: string;
    includes_snapshots: boolean;
    includes_events: boolean;
    includes_shader_source: boolean;
    includes_resource_metadata: boolean;
    includes_index: boolean;
    max_events?: number;
    safe_to_share: boolean;
  }
> = {
  MINIMAL: {
    description: 'Environment, capability matrix, aggregated metrics, summaries',
    includes_snapshots: false,
    includes_events: false,
    includes_shader_source: false,
    includes_resource_metadata: false,
    includes_index: false,
    safe_to_share: true,
  },
  STANDARD: {
    description: 'Snapshots + event chunks sufficient for replay',
    includes_snapshots: true,
    includes_events: true,
    includes_shader_source: false,
    includes_resource_metadata: true,
    includes_index: true,
    safe_to_share: false,
  },
  FULL: {
    description: 'All chunks + verbose payloads (shader sources, full metadata)',
    includes_snapshots: true,
    includes_events: true,
    includes_shader_source: true,
    includes_resource_metadata: true,
    includes_index: true,
    safe_to_share: false,
  },
  FULL_REDACTED: {
    description: 'Full export with sensitive data redacted',
    includes_snapshots: true,
    includes_events: true,
    includes_shader_source: false, // Optionally included
    includes_resource_metadata: true,
    includes_index: true,
    safe_to_share: true,
  },
};

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate a trace header
 */
export function validateTraceHeader(header: TraceHeader): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Version check
  if (!header.version) {
    errors.push('Missing trace version');
  } else if (!isVersionCompatible(header.version)) {
    errors.push(
      `Incompatible trace version: ${header.version} (requires >= ${MIN_COMPATIBLE_VERSION})`
    );
  }

  // Required fields
  if (!header.session_id) errors.push('Missing session_id');
  if (!header.created_at) errors.push('Missing created_at');
  if (!header.environment) errors.push('Missing environment');
  if (!header.contexts || header.contexts.length === 0) {
    warnings.push('No contexts in trace');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a trace version is compatible
 */
export function isVersionCompatible(version: string): boolean {
  const [major, minor] = version.split('.').map(Number);
  const [minMajor, minMinor] = MIN_COMPATIBLE_VERSION.split('.').map(Number);

  if (major > minMajor) return true;
  if (major < minMajor) return false;
  return minor >= minMinor;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Create an empty trace
 */
export function createEmptyTrace(
  sessionId: string,
  environment: TraceEnvironment,
  profile: ExportProfile = 'STANDARD'
): Trace {
  return {
    header: {
      version: TRACE_VERSION,
      kernel_version: '1.0.0', // Will be set by kernel
      created_at: new Date().toISOString(),
      session_id: sessionId,
      export_profile: profile,
      environment,
      contexts: [],
      capture_mode: 'STANDARD',
      time_range: { start: 0, end: 0 },
      frame_range: { start: 0, end: 0 },
      stats: {
        event_count: 0,
        events_by_type: {},
        node_count: 0,
        nodes_by_type: {},
        edge_count: 0,
        frame_count: 0,
        snapshot_count: 0,
        chunk_count: 0,
        compressed_bytes: 0,
        uncompressed_bytes: 0,
      },
    },
    dictionary: {
      strings: [],
      entity_ids: [],
      property_keys: [],
      event_types: [],
    },
    snapshots: [],
    events: [],
  };
}

/**
 * Estimate trace size in bytes
 */
export function estimateTraceSize(trace: Trace): number {
  // Rough estimation
  const headerSize = JSON.stringify(trace.header).length;
  const dictSize = JSON.stringify(trace.dictionary).length;
  const snapshotSize = trace.snapshots.reduce(
    (sum, s) => sum + JSON.stringify(s.graph).length,
    0
  );
  const eventsSize = trace.events.reduce(
    (sum, chunk) => sum + (chunk.compressed_data?.length || JSON.stringify(chunk.events).length),
    0
  );

  return headerSize + dictSize + snapshotSize + eventsSize;
}
