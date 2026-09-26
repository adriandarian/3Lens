/**
 * Lens Transport Interface
 *
 * Transport protocol for remote UI communication.
 *
 * @packageDocumentation
 */

/**
 * Transport message
 */
export interface TransportMessage {
  /** Protocol version */
  protocol_version: string;
  /** Session ID */
  session_id: string;
  /** Message ID */
  message_id: string;
  /** Message type */
  type: MessageType;
  /** Context ID (if applicable) */
  context_id?: string;
  /** Sequence number */
  seq?: number;
  /** Timestamp */
  timestamp: number;
  /** Payload */
  payload: unknown;
}

/**
 * Message types
 */
export type MessageType =
  // Handshake
  | 'hello'
  | 'hello_ack'
  // Capability negotiation
  | 'capabilities'
  // Data transfer
  | 'snapshot_chunk'
  | 'event_chunk'
  | 'state_update'
  // Commands
  | 'command_request'
  | 'command_response'
  // Control
  | 'warning'
  | 'error'
  | 'disconnect';

/**
 * Lens transport interface
 */
export interface LensTransport {
  /** Send a message */
  send(message: TransportMessage): void;

  /** Handle incoming messages */
  onMessage(handler: (message: TransportMessage) => void): () => void;

  /** Flush pending messages */
  flush?(): Promise<void>;

  /** Close the transport */
  close(): void;

  /** Whether transport is connected */
  isConnected(): boolean;
}

/**
 * Transport options
 */
export interface TransportOptions {
  /** Batch messages */
  batching?: boolean;
  /** Batch interval in ms */
  batchInterval?: number;
  /** Max batch size */
  maxBatchSize?: number;
  /** Enable compression */
  compression?: boolean;
  /**
   * Target origin used when sending to a Window.
   * Defaults to the current page origin. Use "*" only when explicitly required.
   */
  targetOrigin?: string;
  /**
   * Origins accepted from Window message events.
   * Defaults to the current page origin. Use ["*"] only when explicitly required.
   */
  allowedOrigins?: string[];
}

/**
 * Create a postMessage transport
 */
export function createPostMessageTransport(
  target: Window | Worker | MessagePort,
  options: TransportOptions = {}
): LensTransport {
  const handlers = new Set<(message: TransportMessage) => void>();
  let connected = true;
  let pendingMessages: TransportMessage[] = [];
  let batchTimeout: number | null = null;

  const windowTarget =
    typeof Window !== 'undefined' && target instanceof Window ? target : null;
  const currentOrigin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : undefined;
  const targetOrigin = options.targetOrigin ?? currentOrigin ?? '*';
  const allowedOrigins = new Set(
    options.allowedOrigins ?? (currentOrigin ? [currentOrigin] : [])
  );
  const allowAnyOrigin = allowedOrigins.has('*');

  const flushBatch = () => {
    if (pendingMessages.length === 0) return;

    const messages = pendingMessages;
    pendingMessages = [];

    const payload = messages.length === 1 ? messages[0] : { type: 'batch', messages };

    if (windowTarget) {
      windowTarget.postMessage(payload, targetOrigin);
    } else {
      target.postMessage(payload);
    }
  };

  // Listen for messages
  const messageHandler = (event: MessageEvent) => {
    if (windowTarget) {
      if (event.source !== windowTarget) return;
      if (!allowAnyOrigin && allowedOrigins.size > 0 && !allowedOrigins.has(event.origin)) {
        return;
      }
    }

    const data = event.data;
    if (!data || typeof data !== 'object') return;

    // Handle batched messages
    if (data.type === 'batch' && Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        for (const handler of handlers) {
          handler(msg);
        }
      }
    } else if (data.protocol_version) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  };

  if (windowTarget) {
    window.addEventListener('message', messageHandler);
  } else if ('onmessage' in target) {
    target.onmessage = messageHandler;
  }

  return {
    send(message: TransportMessage) {
      if (!connected) return;

      if (options.batching) {
        pendingMessages.push(message);

        if (pendingMessages.length >= (options.maxBatchSize ?? 100)) {
          flushBatch();
        } else if (!batchTimeout) {
          batchTimeout = setTimeout(() => {
            batchTimeout = null;
            flushBatch();
          }, options.batchInterval ?? 16) as unknown as number;
        }
      } else if (windowTarget) {
        windowTarget.postMessage(message, targetOrigin);
      } else {
        target.postMessage(message);
      }
    },

    onMessage(handler: (message: TransportMessage) => void) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },

    async flush() {
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }
      flushBatch();
    },

    close() {
      connected = false;
      handlers.clear();
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }
      if (windowTarget) {
        window.removeEventListener('message', messageHandler);
      } else if ('onmessage' in target && target.onmessage === messageHandler) {
        target.onmessage = null;
      }
    },

    isConnected() {
      return connected;
    },
  };
}
