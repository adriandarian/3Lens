/**
 * Event Emitter
 *
 * Type-safe event emission utilities.
 *
 * @packageDocumentation
 */

import type { Event, EventType } from '../schema/events';

/**
 * Event emitter interface
 */
export interface EventEmitter {
  /** Emit an event */
  emit(event: Event): void;

  /** Subscribe to specific event types */
  on<T extends EventType>(type: T, handler: (event: Extract<Event, { type: T }>) => void): () => void;

  /** Subscribe to all events */
  onAny(handler: (event: Event) => void): () => void;

  /** Unsubscribe all handlers */
  clear(): void;
}

/**
 * Create an event emitter
 */
export function createEventEmitter(): EventEmitter {
  const handlers = new Map<EventType | '*', Set<(event: Event) => void>>();

  return {
    emit(event: Event) {
      // Notify type-specific handlers
      const typeHandlers = handlers.get(event.type);
      if (typeHandlers) {
        for (const handler of typeHandlers) {
          try {
            handler(event);
          } catch (e) {
            console.error(`[3Lens] Event handler error for ${event.type}:`, e);
          }
        }
      }

      // Notify wildcard handlers
      const anyHandlers = handlers.get('*' as EventType);
      if (anyHandlers) {
        for (const handler of anyHandlers) {
          try {
            handler(event);
          } catch (e) {
            console.error('[3Lens] Event handler error:', e);
          }
        }
      }
    },

    on<T extends EventType>(type: T, handler: (event: Extract<Event, { type: T }>) => void) {
      if (!handlers.has(type)) {
        handlers.set(type, new Set());
      }
      handlers.get(type)!.add(handler as (event: Event) => void);

      return () => {
        handlers.get(type)?.delete(handler as (event: Event) => void);
      };
    },

    onAny(handler: (event: Event) => void) {
      const key = '*' as EventType;
      if (!handlers.has(key)) {
        handlers.set(key, new Set());
      }
      handlers.get(key)!.add(handler);

      return () => {
        handlers.get(key)?.delete(handler);
      };
    },

    clear() {
      handlers.clear();
    },
  };
}
