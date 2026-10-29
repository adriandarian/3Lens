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
  /** Bounded recording limits; oldest events are dropped before checkpoints. */
  maxEvents?: number;
  maxBytes?: number;
  /** Maintain a replay checkpoint while oldest events leave the retained window. */
  onDrop?: (event: Event) => void;
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
  /** Read retained capture events for query projections without exporting a file. */
  getEvents(): Event[];

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
  droppedEvents: number;
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

  let droppedEvents = 0;
  let eventBytes = 0;
  let retainedEvents = 0;
  const maxEvents = config.maxEvents ?? 20000;
  const maxBytes = config.maxBytes ?? 8 * 1024 * 1024;

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
      droppedEvents = 0;
      eventBytes = 0;
      retainedEvents = 0;
      lastSnapshotFrame = -config.snapshotInterval;
    },

    stopRecording() {
      recording = false;
      flushChunk();
    },

    isRecording() {
      return recording;
    },

    getEvents() {
      return chunks.flatMap(chunk => chunk.events).concat(events);
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

      events.push(structuredClone(event));
      retainedEvents++;
      eventBytes += JSON.stringify(event).length * 2;
      // Drop oldest chunks/events to keep prolonged captures bounded. Export includes
      // a current graph checkpoint, and explicitly reports any missing history.
      while (retainedEvents > maxEvents || eventBytes > maxBytes) {
        if (chunks.length) {
          const chunk = chunks.shift()!;
          for (const old of chunk.events) { eventBytes -= JSON.stringify(old).length * 2; config.onDrop?.(old); }
          retainedEvents -= chunk.events.length;
          droppedEvents += chunk.events.length;
        } else {
          const old = events.shift();
          if (!old) break;
          eventBytes -= JSON.stringify(old).length * 2;
          config.onDrop?.(old);
          retainedEvents--;
          droppedEvents++;
        }
      }

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

      snapshots.push(structuredClone(snapshot));
      if (snapshots.length > 2) snapshots.splice(1, snapshots.length - 2);
      lastSnapshotFrame = frame;
    },

    export(options: ExportOptions = { profile: 'STANDARD' }): Trace {
      flushChunk();

      const spec = EXPORT_PROFILE_SPECS[options.profile];
      const trace = createEmptyTrace(config.sessionId, config.environment, options.profile);

      // Build header
      trace.header.kernel_version = TRACE_VERSION;
      trace.header.capture_mode = config.captureMode;
      trace.header.dropped_events = droppedEvents;
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
        droppedEvents,
        eventCount: retainedEvents,
        snapshotCount: snapshots.length,
        chunkCount: chunks.length,
        estimatedBytes: eventBytes,
      };
    },
  };

  return manager;
}
