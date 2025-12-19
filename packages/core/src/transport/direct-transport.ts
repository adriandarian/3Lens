import type { Transport, DebugMessage, Unsubscribe } from '../types';

/**
 * Create a direct transport for in-app overlay communication
 * Messages are passed directly without serialization
 */
export function createDirectTransport(): {
  probeTransport: Transport;
  uiTransport: Transport;
} {
  const probeToUi: Array<(message: DebugMessage) => void> = [];
  const uiToProbe: Array<(message: DebugMessage) => void> = [];
  const probeConnectionCallbacks: Array<(connected: boolean) => void> = [];
  const uiConnectionCallbacks: Array<(connected: boolean) => void> = [];
  let probeConnected = false;
  let uiConnected = false;

  const probeTransport: Transport = {
    send(message: DebugMessage): void {
      for (const callback of probeToUi) {
        try {
          callback(message);
        } catch (e) {
          console.error('[3Lens] Error in direct transport:', e);
        }
      }
    },

    onReceive(handler: (message: DebugMessage) => void): Unsubscribe {
      uiToProbe.push(handler);
      return () => {
        const index = uiToProbe.indexOf(handler);
        if (index > -1) {
          uiToProbe.splice(index, 1);
        }
      };
    },

    isConnected(): boolean {
      return probeConnected && uiConnected;
    },

    onConnectionChange(handler: (connected: boolean) => void): Unsubscribe {
      probeConnectionCallbacks.push(handler);
      return () => {
        const index = probeConnectionCallbacks.indexOf(handler);
        if (index > -1) {
          probeConnectionCallbacks.splice(index, 1);
        }
      };
    },

    close(): void {
      probeConnected = false;
      for (const cb of probeConnectionCallbacks) {
        cb(false);
      }
      for (const cb of uiConnectionCallbacks) {
        cb(false);
      }
    },
  };

  const uiTransport: Transport = {
    send(message: DebugMessage): void {
      for (const callback of uiToProbe) {
        try {
          callback(message);
        } catch (e) {
          console.error('[3Lens] Error in direct transport:', e);
        }
      }
    },

    onReceive(handler: (message: DebugMessage) => void): Unsubscribe {
      probeToUi.push(handler);
      // Mark as connected when UI starts receiving
      if (!uiConnected) {
        uiConnected = true;
        probeConnected = true;
        for (const cb of probeConnectionCallbacks) {
          cb(true);
        }
        for (const cb of uiConnectionCallbacks) {
          cb(true);
        }
      }
      return () => {
        const index = probeToUi.indexOf(handler);
        if (index > -1) {
          probeToUi.splice(index, 1);
        }
      };
    },

    isConnected(): boolean {
      return probeConnected && uiConnected;
    },

    onConnectionChange(handler: (connected: boolean) => void): Unsubscribe {
      uiConnectionCallbacks.push(handler);
      return () => {
        const index = uiConnectionCallbacks.indexOf(handler);
        if (index > -1) {
          uiConnectionCallbacks.splice(index, 1);
        }
      };
    },

    close(): void {
      uiConnected = false;
      for (const cb of probeConnectionCallbacks) {
        cb(false);
      }
      for (const cb of uiConnectionCallbacks) {
        cb(false);
      }
    },
  };

  return { probeTransport, uiTransport };
}

