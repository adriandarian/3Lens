/**
 * Capture Context Implementation
 *
 * @packageDocumentation
 */

import type { Event, CaptureMode } from '../schema/events';
import type {
  CaptureContext,
  CaptureContextConfig,
  EventHandler,
  Unsubscribe,
  OverheadMetrics,
  DegradeTriggers,
} from './types';
import { DEFAULT_DEGRADE_TRIGGERS } from './types';
import { RingBuffer } from './ring-buffer';

/**
 * Create a capture context
 */
export function createCaptureContext(config: CaptureContextConfig): CaptureContext {
  let seq = 0;
  let active = false;
  let currentMode = config.mode;
  const handlers: Set<EventHandler> = new Set();
  const buffer = new RingBuffer<Event>(config.bufferSizeBytes);

  // Overhead tracking
  let captureStartTime = 0;
  let frameOverheadMs = 0;
  let eventCount = 0;
  let lastEventCountReset = performance.now();
  let dropCount = 0;

  const context: CaptureContext = {
    get id() {
      return config.id;
    },

    get mode() {
      return currentMode;
    },

    get seq() {
      return seq;
    },

    get active() {
      return active;
    },

    emit(partialEvent: Omit<Event, 'seq' | 'context_id'>) {
      if (!active) return;

      const startTime = performance.now();

      // Create full event
      const event = {
        ...partialEvent,
        seq: seq++,
        context_id: config.id,
      } as Event;

      // Check mode filter
      if (!shouldEmitEvent(event, currentMode)) {
        return;
      }

      // Try to add to buffer
      const added = buffer.push(event);
      if (!added) {
        dropCount++;
      }

      // Notify handlers
      for (const handler of handlers) {
        try {
          handler(event);
        } catch (e) {
          console.error('[3Lens] Event handler error:', e);
        }
      }

      // Track overhead
      frameOverheadMs += performance.now() - startTime;
      eventCount++;

      // Check auto-degrade
      if (config.autoDegrade) {
        checkAutoDegrade();
      }
    },

    start() {
      active = true;
      captureStartTime = performance.now();
    },

    stop() {
      active = false;
    },

    getOverheadMetrics(): OverheadMetrics {
      const now = performance.now();
      const elapsed = (now - lastEventCountReset) / 1000;
      const eventRate = elapsed > 0 ? eventCount / elapsed : 0;

      // Reset counters periodically
      if (elapsed > 1) {
        eventCount = 0;
        frameOverheadMs = 0;
        lastEventCountReset = now;
      }

      return {
        captureTimeMs: frameOverheadMs,
        eventRate,
        bufferUsedBytes: buffer.usedBytes,
        bufferCapacityBytes: buffer.capacityBytes,
        dropCount,
        currentMode,
      };
    },

    subscribe(handler: EventHandler): Unsubscribe {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
  };

  function checkAutoDegrade() {
    const metrics = context.getOverheadMetrics();
    const triggers = DEFAULT_DEGRADE_TRIGGERS;

    const shouldDegrade =
      metrics.captureTimeMs > triggers.frameOverheadMs ||
      metrics.eventRate > triggers.eventRatePerSec ||
      metrics.bufferUsedBytes / metrics.bufferCapacityBytes > triggers.bufferUsagePercent / 100;

    if (shouldDegrade && currentMode !== 'MINIMAL') {
      const newMode = currentMode === 'DEEP' ? 'STANDARD' : 'MINIMAL';
      console.warn(`[3Lens] Auto-degrading capture mode from ${currentMode} to ${newMode}`);
      currentMode = newMode;

      // Emit warning event
      context.emit({
        type: 'warning_event',
        timestamp: performance.now(),
        category: 'degraded_mode',
        message: `Capture mode degraded to ${newMode} due to overhead pressure`,
        details: {
          captureTimeMs: metrics.captureTimeMs,
          eventRate: metrics.eventRate,
          bufferUsagePercent: (metrics.bufferUsedBytes / metrics.bufferCapacityBytes) * 100,
        },
      });
    }
  }

  return context;
}

/**
 * Check if an event should be emitted based on capture mode
 */
function shouldEmitEvent(event: Event, mode: CaptureMode): boolean {
  // Always emit these event types
  const alwaysEmit = [
    'context_register',
    'context_update',
    'context_unregister',
    'attach_point',
    'warning_event',
    'error_event',
  ];

  if (alwaysEmit.includes(event.type)) {
    return true;
  }

  // MINIMAL mode: only counters/signals, no detailed events
  if (mode === 'MINIMAL') {
    const minimalEvents = ['frame_begin', 'frame_end'];
    return minimalEvents.includes(event.type);
  }

  // STANDARD mode: event stream + core relationships
  if (mode === 'STANDARD') {
    const deepOnlyEvents = ['pass_begin', 'pass_end', 'object_update', 'draw_call'];
    return !deepOnlyEvents.includes(event.type);
  }

  // DEEP mode: all events
  return true;
}
