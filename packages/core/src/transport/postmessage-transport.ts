import type { Transport, DebugMessage, Unsubscribe } from '../types';

const SOURCE_PROBE = '3lens-probe';
const SOURCE_DEVTOOL = '3lens-devtool';

interface PostMessageWrapper {
  source: typeof SOURCE_PROBE | typeof SOURCE_DEVTOOL;
  version: string;
  payload: DebugMessage;
}

/**
 * Create a postMessage transport for browser extension communication
 */
export function createPostMessageTransport(): Transport {
  const receiveCallbacks: Array<(message: DebugMessage) => void> = [];
  const connectionCallbacks: Array<(connected: boolean) => void> = [];
  let connected = false;

  // Listen for messages from devtool
  const handleMessage = (event: MessageEvent<PostMessageWrapper>) => {
    // Only accept messages from same origin
    if (event.origin !== window.location.origin) return;

    // Validate message structure
    if (!event.data || event.data.source !== SOURCE_DEVTOOL) return;

    const { payload } = event.data;

    // Handle connection
    if (payload.type === 'handshake-request') {
      if (!connected) {
        connected = true;
        for (const cb of connectionCallbacks) {
          cb(true);
        }
      }
    }

    // Notify callbacks
    for (const callback of receiveCallbacks) {
      try {
        callback(payload);
      } catch (e) {
        console.error('[3Lens] Error in receive callback:', e);
      }
    }
  };

  window.addEventListener('message', handleMessage);

  return {
    send(message: DebugMessage): void {
      const wrapper: PostMessageWrapper = {
        source: SOURCE_PROBE,
        version: '1.0.0',
        payload: message,
      };
      window.postMessage(wrapper, window.location.origin);
    },

    onReceive(handler: (message: DebugMessage) => void): Unsubscribe {
      receiveCallbacks.push(handler);
      return () => {
        const index = receiveCallbacks.indexOf(handler);
        if (index > -1) {
          receiveCallbacks.splice(index, 1);
        }
      };
    },

    isConnected(): boolean {
      return connected;
    },

    onConnectionChange(handler: (connected: boolean) => void): Unsubscribe {
      connectionCallbacks.push(handler);
      return () => {
        const index = connectionCallbacks.indexOf(handler);
        if (index > -1) {
          connectionCallbacks.splice(index, 1);
        }
      };
    },

    close(): void {
      window.removeEventListener('message', handleMessage);
      receiveCallbacks.length = 0;
      connectionCallbacks.length = 0;
      if (connected) {
        connected = false;
        for (const cb of connectionCallbacks) {
          cb(false);
        }
      }
    },
  };
}
