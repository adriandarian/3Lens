/**
 * Trace Manager
 *
 * Manages trace recording and storage.
 *
 * @packageDocumentation
 */

import type { Event, CaptureMode } from '../schema/events';
import type {
  Trace,
  TraceHeader,
  TraceEnvironment,
  TraceEventChunk,
  TraceSnapshot,
  ExportProfile,
  ExportOptions,
} from '../schema/trace';
import { TRACE_VERSION, createEmptyTrace, EXPORT_PROFILE_SPECS } from '../schema/trace';
import type { EntityGraph, GraphSnapshot } from '../schema/entity-graph';

/**
 * Trace manager configuration
 */
export interface TraceManagerConfig {
  /** Session ID */
  sessionId: string;
  /** Environment info */
  environment: TraceEnvironment;
  /** Capture mode */
  captureMode: CaptureMode;
  /** Chunk size (number of events per chunk) */
  chunkSize: number;
  /** Snapshot interval (frames) */
  snapshotInterval: number;
}

/**
 * Trace manager interface
 */
export interface TraceManager {
  /** Start recording */
  startRecording(): void;

  /** Stop recording */
  stopRecording(): void;

  /** Whether recording is active */
  isRecording(): boolean;

  /** Add an event to the trace */
  addEvent(event: Event): void;

  /** Add a graph snapshot */
  addSnapshot(graph: EntityGraph, frame: number): void;

  /** Export trace with specified options */
  export(options?: ExportOptions): Trace;

  /** Get current trace stats */
  getStats(): TraceStats;
}

/**
 * Trace statistics
 */
export interface TraceStats {
  eventCount: number;
  snapshotCount: number;
  chunkCount: number;
  estimatedBytes: number;
}

/**
 * Create a trace manager
 */
export function createTraceManager(config: TraceManagerConfig): TraceManager {
  let recording = false;
  let events: Event[] = [];
  let chunks: TraceEventChunk[] = [];
  let snapshots: TraceSnapshot[] = [];
  let frameNumber = 0;
  let seqNumber = 0;
  let startTime = 0;
  let lastSnapshotFrame = -config.snapshotInterval;

  const contexts = new Map<string, { display_name: string }>();

  function flushChunk(): void {
    if (events.length === 0) return;

    const chunk: TraceEventChunk = {
      index: chunks.length,
      time_range: {
        start: events[0].timestamp,
        end: events[events.length - 1].timestamp,
      },
      seq_range: {
        start: events[0].seq,
        end: events[events.length - 1].seq,
      },
      events: [...events],
      compressed: false,
    };

    chunks.push(chunk);
    events = [];
  }

  const manager: TraceManager = {
    startRecording() {
      recording = true;
      startTime = performance.now();
      events = [];
      chunks = [];
      snapshots = [];
      frameNumber = 0;
      seqNumber = 0;
    },

    stopRecording() {
      recording = false;
      flushChunk();
    },

    isRecording() {
      return recording;
    },

    addEvent(event: Event) {
      if (!recording) return;

      // Track frame number
      if (event.type === 'frame_begin' && 'frame' in event) {
        frameNumber = (event as { frame: number }).frame;
      }

      // Track contexts
      if (event.type === 'context_register') {
        const regEvent = event as { context_id: string; display_name: string };
        contexts.set(regEvent.context_id, { display_name: regEvent.display_name });
      }

      events.push(event);

      // Flush chunk if needed
      if (events.length >= config.chunkSize) {
        flushChunk();
      }
    },

    addSnapshot(graph: EntityGraph, frame: number) {
      if (!recording) return;

      // Only snapshot at interval
      if (frame - lastSnapshotFrame < config.snapshotInterval) return;

      const snapshot: TraceSnapshot = {
        timestamp: performance.now(),
        frame,
        seq: seqNumber,
        graph: graph.snapshot(),
        is_initial: snapshots.length === 0,
        context_ids: Array.from(contexts.keys()),
      };

      snapshots.push(snapshot);
      lastSnapshotFrame = frame;
    },

    export(options: ExportOptions = { profile: 'STANDARD' }): Trace {
      flushChunk();

      const spec = EXPORT_PROFILE_SPECS[options.profile];
      const trace = createEmptyTrace(config.sessionId, config.environment, options.profile);

      // Build header
      trace.header.kernel_version = TRACE_VERSION;
      trace.header.capture_mode = config.captureMode;
      trace.header.time_range = {
        start: startTime,
        end: performance.now(),
      };
      trace.header.frame_range = {
        start: 0,
        end: frameNumber,
      };
      trace.header.contexts = Array.from(contexts.entries()).map(([id, info]) => ({
        id,
        display_name: info.display_name,
        discovery: 'manual',
        discovery_fidelity: 'EXACT',
        backend: config.environment.backend,
      }));

      // Build dictionary (TODO: implement string interning)
      trace.dictionary = {
        strings: [],
        entity_ids: [],
        property_keys: [],
        event_types: [],
      };

      // Add snapshots if included
      if (spec.includes_snapshots) {
        trace.snapshots = snapshots;
      }

      // Add events if included
      if (spec.includes_events) {
        trace.events = options.time_range
          ? chunks.filter(
              (c) =>
                c.time_range.start >= options.time_range![0] &&
                c.time_range.end <= options.time_range![1]
            )
          : chunks;
      }

      // Compute stats
      let eventCount = 0;
      const eventsByType: Record<string, number> = {};
      for (const chunk of trace.events) {
        eventCount += chunk.events.length;
        for (const event of chunk.events) {
          eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        }
      }

      trace.header.stats = {
        event_count: eventCount,
        events_by_type: eventsByType,
        node_count: snapshots.length > 0 ? snapshots[snapshots.length - 1].graph.nodes.length : 0,
        nodes_by_type: {},
        edge_count: snapshots.length > 0 ? snapshots[snapshots.length - 1].graph.edges.length : 0,
        frame_count: frameNumber,
        snapshot_count: snapshots.length,
        chunk_count: trace.events.length,
        compressed_bytes: 0,
        uncompressed_bytes: JSON.stringify(trace).length,
      };

      return trace;
    },

    getStats(): TraceStats {
      return {
        eventCount: events.length + chunks.reduce((sum, c) => sum + c.events.length, 0),
        snapshotCount: snapshots.length,
        chunkCount: chunks.length,
        estimatedBytes:
          events.reduce((sum, e) => sum + JSON.stringify(e).length, 0) +
          chunks.reduce((sum, c) => sum + JSON.stringify(c).length, 0),
      };
    },
  };

  return manager;
}
