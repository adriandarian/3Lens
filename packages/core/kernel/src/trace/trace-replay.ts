/**
 * Trace Replay
 *
 * Replay traces for offline analysis.
 *
 * @packageDocumentation
 */

import type { Event } from '../schema/events';
import type { Trace, TraceSnapshot, TraceEventChunk } from '../schema/trace';
import type { EntityGraph, GraphSnapshot } from '../schema/entity-graph';
import { createEntityGraph } from '../graph/entity-graph-impl';

/**
 * Replay state
 */
export interface ReplayState {
  /** Current graph state */
  graph: EntityGraph;
  /** Current event index */
  eventIndex: number;
  /** Current frame */
  frame: number;
  /** Current time */
  time: number;
  /** Total events */
  totalEvents: number;
  /** Is at end of trace */
  isAtEnd: boolean;
}

/**
 * Replay options
 */
export interface ReplayOptions {
  /** Event handler called for each event */
  onEvent?: (event: Event, state: ReplayState) => void;
  /** Frame handler called at frame boundaries */
  onFrame?: (frame: number, state: ReplayState) => void;
}

/**
 * Trace replayer
 */
export interface TraceReplayer {
  /** Get current state */
  getState(): ReplayState;

  /** Seek to a specific event index */
  seekToEvent(index: number): void;

  /** Seek to a specific frame */
  seekToFrame(frame: number): void;

  /** Seek to a specific time */
  seekToTime(time: number): void;

  /** Step forward one event */
  stepForward(): Event | undefined;

  /** Step backward one event */
  stepBackward(): Event | undefined;

  /** Play forward continuously */
  play(speed?: number): void;

  /** Pause playback */
  pause(): void;

  /** Get all events in a frame */
  getFrameEvents(frame: number): Event[];

  /** Get events in a time range */
  getEventsInRange(start: number, end: number): Event[];

  /** Get the graph state at a specific frame */
  getGraphAtFrame(frame: number): EntityGraph;
}

/**
 * Create a trace replayer
 */
export function createTraceReplayer(trace: Trace, options: ReplayOptions = {}): TraceReplayer {
  // Flatten all events
  const allEvents: Event[] = trace.events.flatMap((chunk) => chunk.events);

  // Build frame index
  const frameIndex = new Map<number, number[]>();
  allEvents.forEach((event, index) => {
    if ('frame' in event) {
      const frame = (event as { frame: number }).frame;
      if (!frameIndex.has(frame)) {
        frameIndex.set(frame, []);
      }
      frameIndex.get(frame)!.push(index);
    }
  });

  // State
  let graph = createEntityGraph();
  let eventIndex = 0;
  let currentFrame = 0;
  let playing = false;
  let playbackSpeed = 1;

  // Restore from initial snapshot if available
  if (trace.snapshots.length > 0) {
    graph.restore(trace.snapshots[0].graph);
  }

  function getState(): ReplayState {
    const currentEvent = allEvents[eventIndex];
    return {
      graph,
      eventIndex,
      frame: currentFrame,
      time: currentEvent?.timestamp ?? 0,
      totalEvents: allEvents.length,
      isAtEnd: eventIndex >= allEvents.length,
    };
  }

  function applyEvent(event: Event): void {
    // Update graph based on event
    if (event.type === 'object_added') {
      const e = event as Event & { entity_id: string; object_type: string; parent_id: string };
      graph.addNode({
        id: e.entity_id,
        type: 'object3d',
        context_id: event.context_id,
        name: (event as { name?: string }).name,
        created_at: event.seq,
        modified_at: event.seq,
        origin: 'created',
        active: true,
        object_type: e.object_type,
        visible: true,
        frustum_culled: true,
        render_order: 0,
        layer_mask: 1,
        parent_id: e.parent_id,
        child_count: 0,
      });
    } else if (event.type === 'object_removed') {
      const e = event as Event & { entity_id: string };
      graph.updateNode(e.entity_id, { active: false });
    } else if (event.type === 'resource_create') {
      const e = event as Event & { entity_id: string; resource_type: string };
      // Add appropriate node based on resource type
      graph.addNode({
        id: e.entity_id,
        type: e.resource_type as any,
        context_id: event.context_id,
        created_at: event.seq,
        modified_at: event.seq,
        origin: 'created',
        active: true,
      } as any);
    } else if (event.type === 'resource_dispose') {
      const e = event as Event & { entity_id: string };
      graph.updateNode(e.entity_id, { active: false });
    }

    // Track frame
    if (event.type === 'frame_begin') {
      currentFrame = (event as { frame: number }).frame;
      options.onFrame?.(currentFrame, getState());
    }

    options.onEvent?.(event, getState());
  }

  const replayer: TraceReplayer = {
    getState,

    seekToEvent(index: number) {
      if (index < 0 || index >= allEvents.length) return;

      // If seeking backward, restore from nearest snapshot
      if (index < eventIndex) {
        // Find nearest snapshot before target
        let nearestSnapshot: TraceSnapshot | undefined;
        for (const snapshot of trace.snapshots) {
          if (snapshot.seq <= allEvents[index]?.seq) {
            nearestSnapshot = snapshot;
          } else {
            break;
          }
        }

        if (nearestSnapshot) {
          graph.restore(nearestSnapshot.graph);
          eventIndex = allEvents.findIndex((e) => e.seq >= nearestSnapshot!.seq);
        } else {
          // No snapshot, replay from start
          graph = createEntityGraph();
          if (trace.snapshots.length > 0) {
            graph.restore(trace.snapshots[0].graph);
          }
          eventIndex = 0;
        }
      }

      // Apply events up to target
      while (eventIndex < index) {
        applyEvent(allEvents[eventIndex]);
        eventIndex++;
      }
    },

    seekToFrame(frame: number) {
      const indices = frameIndex.get(frame);
      if (indices && indices.length > 0) {
        replayer.seekToEvent(indices[0]);
      }
    },

    seekToTime(time: number) {
      const index = allEvents.findIndex((e) => e.timestamp >= time);
      if (index >= 0) {
        replayer.seekToEvent(index);
      }
    },

    stepForward(): Event | undefined {
      if (eventIndex >= allEvents.length) return undefined;

      const event = allEvents[eventIndex];
      applyEvent(event);
      eventIndex++;
      return event;
    },

    stepBackward(): Event | undefined {
      if (eventIndex <= 0) return undefined;

      eventIndex--;
      replayer.seekToEvent(eventIndex);
      return allEvents[eventIndex];
    },

    play(speed: number = 1) {
      playbackSpeed = speed;
      playing = true;

      // Playback loop
      const playFrame = () => {
        if (!playing || eventIndex >= allEvents.length) {
          playing = false;
          return;
        }

        replayer.stepForward();
        requestAnimationFrame(playFrame);
      };

      requestAnimationFrame(playFrame);
    },

    pause() {
      playing = false;
    },

    getFrameEvents(frame: number): Event[] {
      const indices = frameIndex.get(frame);
      if (!indices) return [];
      return indices.map((i) => allEvents[i]);
    },

    getEventsInRange(start: number, end: number): Event[] {
      return allEvents.filter((e) => e.timestamp >= start && e.timestamp <= end);
    },

    getGraphAtFrame(frame: number): EntityGraph {
      const currentIdx = eventIndex;
      replayer.seekToFrame(frame);
      const graphCopy = createEntityGraph();
      graphCopy.restore(graph.snapshot());
      replayer.seekToEvent(currentIdx);
      return graphCopy;
    },
  };

  return replayer;
}
