/**
 * PostMessage Transport Test Suite
 *
 * Tests for browser extension communication via postMessage.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPostMessageTransport } from './postmessage-transport';
import type { DebugMessage, FrameStats } from '../types';

// Constants matching the implementation
const SOURCE_PROBE = '3lens-probe';
const SOURCE_DEVTOOL = '3lens-devtool';

// Mock stats object for tests (partial mock with type assertion)
const mockStats = {
  frame: 1,
  timestamp: 0,
  deltaTimeMs: 16,
  cpuTimeMs: 8,
} as FrameStats;

describe('createPostMessageTransport', () => {
  let transport: ReturnType<typeof createPostMessageTransport>;
  let messageListeners: Array<(event: MessageEvent) => void> = [];
  let removedListeners: Array<(event: MessageEvent) => void> = [];

  // Mock window
  const originalWindow = global.window;

  beforeEach(() => {
    messageListeners = [];
    removedListeners = [];

    // Mock window object
    (global as any).window = {
      location: {
        origin: 'http://localhost',
      },
      addEventListener: vi.fn((type: string, listener: any) => {
        if (type === 'message') {
          messageListeners.push(listener);
        }
      }),
      removeEventListener: vi.fn((type: string, listener: any) => {
        if (type === 'message') {
          removedListeners.push(listener);
          const idx = messageListeners.indexOf(listener);
          if (idx > -1) messageListeners.splice(idx, 1);
        }
      }),
      postMessage: vi.fn(),
    };

    transport = createPostMessageTransport();
  });

  afterEach(() => {
    (global as any).window = originalWindow;
  });

  // Helper to simulate receiving a message
  function simulateMessage(data: any, origin = 'http://localhost') {
    const event = {
      data,
      origin,
    } as MessageEvent;

    for (const listener of messageListeners) {
      listener(event);
    }
  }

  describe('basic transport creation', () => {
    it('should return transport with all required methods', () => {
      expect(typeof transport.send).toBe('function');
      expect(typeof transport.onReceive).toBe('function');
      expect(typeof transport.isConnected).toBe('function');
      expect(typeof transport.onConnectionChange).toBe('function');
      expect(typeof transport.close).toBe('function');
    });

    it('should add message listener on creation', () => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });
  });

  describe('connection state', () => {
    it('should start disconnected', () => {
      expect(transport.isConnected()).toBe(false);
    });

    it('should become connected on handshake request', () => {
      const callback = vi.fn();
      transport.onConnectionChange(callback);

      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload: { type: 'handshake-request' },
      });

      expect(transport.isConnected()).toBe(true);
      expect(callback).toHaveBeenCalledWith(true);
    });

    it('should only trigger connection once for multiple handshakes', () => {
      const callback = vi.fn();
      transport.onConnectionChange(callback);

      // Multiple handshakes
      for (let i = 0; i < 3; i++) {
        simulateMessage({
          source: SOURCE_DEVTOOL,
          version: '1.0.0',
          payload: { type: 'handshake-request' },
        });
      }

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('sending messages', () => {
    it('should send message via postMessage', () => {
      const message: DebugMessage = {
        type: 'frame-stats',
        timestamp: Date.now(),
        stats: mockStats,
      };

      transport.send(message);

      expect(window.postMessage).toHaveBeenCalledWith(
        {
          source: SOURCE_PROBE,
          version: '1.0.0',
          payload: message,
        },
        'http://localhost'
      );
    });
  });

  describe('receiving messages', () => {
    it('should receive messages from devtool', () => {
      const handler = vi.fn();
      transport.onReceive(handler);

      const payload: DebugMessage = {
        type: 'select-object',
        timestamp: Date.now(),
        debugId: '123',
      };

      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload,
      });

      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('should ignore messages from wrong source', () => {
      const handler = vi.fn();
      transport.onReceive(handler);

      simulateMessage({
        source: 'wrong-source',
        payload: { type: 'frame-stats', stats: mockStats },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should ignore messages from wrong origin', () => {
      const handler = vi.fn();
      transport.onReceive(handler);

      simulateMessage(
        {
          source: SOURCE_DEVTOOL,
          payload: { type: 'frame-stats', stats: mockStats },
        },
        'http://malicious.com'
      );

      expect(handler).not.toHaveBeenCalled();
    });

    it('should ignore messages without data', () => {
      const handler = vi.fn();
      transport.onReceive(handler);

      simulateMessage(null);
      simulateMessage(undefined);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      transport.onReceive(handler1);
      transport.onReceive(handler2);

      const payload: DebugMessage = {
        type: 'frame-stats',
        timestamp: Date.now(),
        stats: mockStats,
      };
      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload,
      });

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
    });

    it('should handle handler errors gracefully', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();

      transport.onReceive(errorHandler);
      transport.onReceive(normalHandler);

      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload: { type: 'frame-stats', stats: mockStats },
      });

      expect(consoleError).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('unsubscribe', () => {
    it('should allow unsubscribing from receive handlers', () => {
      const handler = vi.fn();
      const unsubscribe = transport.onReceive(handler);

      // First message
      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload: { type: 'frame-stats', stats: mockStats },
      });
      expect(handler).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Second message
      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload: { type: 'frame-stats', stats: mockStats },
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing from connection callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = transport.onConnectionChange(callback);

      unsubscribe();

      // Trigger connection
      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload: { type: 'handshake-request' },
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should remove message listener on close', () => {
      transport.close();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });

    it('should clear all handlers on close', () => {
      const handler = vi.fn();
      transport.onReceive(handler);

      transport.close();

      // Messages should no longer be received
      simulateMessage({
        source: SOURCE_DEVTOOL,
        version: '1.0.0',
        payload: { type: 'frame-stats', stats: mockStats },
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
