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

  const flushBatch = () => {
    if (pendingMessages.length === 0) return;

    const messages = pendingMessages;
    pendingMessages = [];

    if (messages.length === 1) {
      target.postMessage(messages[0]);
    } else {
      target.postMessage({ type: 'batch', messages });
    }
  };

  // Listen for messages
  const messageHandler = (event: MessageEvent) => {
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

  if (target instanceof Window) {
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
      }
    },

    isConnected() {
      return connected;
    },
  };
}
