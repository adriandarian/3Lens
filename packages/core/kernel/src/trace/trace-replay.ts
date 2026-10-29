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
import { applyCaptureEvent } from '../graph/capture-projection';
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

  function checkpointCursor(snapshot: TraceSnapshot): number {
    if (snapshot.event_index !== undefined) return snapshot.event_index;
    const index = allEvents.findIndex(event => event.timestamp > snapshot.timestamp);
    return index < 0 ? allEvents.length : index;
  }

  // A final checkpoint is not an initial graph. Start from the genuine initial
  // snapshot, if supplied, and use global event cursors rather than per-context seq.
  const initialSnapshot = trace.snapshots.find(snapshot => snapshot.is_initial);
  if (initialSnapshot) {
    graph.restore(structuredClone(initialSnapshot.graph));
    eventIndex = checkpointCursor(initialSnapshot);
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
    applyCaptureEvent(graph, event);

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
      if (index < 0 || index > allEvents.length) return;
      // Reconstruct from the nearest checkpoint at or before the requested event
      // count. This also correctly handles stepping backward and end-of-trace.
      const checkpoint = [...trace.snapshots]
        .filter(snapshot => checkpointCursor(snapshot) <= index)
        .sort((a,b) => checkpointCursor(b) - checkpointCursor(a))[0];
      graph = createEntityGraph();
      eventIndex = 0;
      currentFrame = 0;
      if (checkpoint) {
        graph.restore(structuredClone(checkpoint.graph));
        eventIndex = checkpointCursor(checkpoint);
        currentFrame = checkpoint.frame;
      }
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

      const previous = eventIndex - 1;
      replayer.seekToEvent(previous);
      return allEvents[previous];
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
