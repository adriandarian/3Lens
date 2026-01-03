/**
 * Direct Transport Test Suite
 *
 * Tests for in-app direct message transport between probe and UI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDirectTransport } from './direct-transport';
import type { DebugMessage } from '../types';

describe('createDirectTransport', () => {
  let transports: ReturnType<typeof createDirectTransport>;

  beforeEach(() => {
    transports = createDirectTransport();
  });

  describe('basic transport creation', () => {
    it('should return both probe and UI transports', () => {
      expect(transports.probeTransport).toBeDefined();
      expect(transports.uiTransport).toBeDefined();
    });

    it('should have send method on both transports', () => {
      expect(typeof transports.probeTransport.send).toBe('function');
      expect(typeof transports.uiTransport.send).toBe('function');
    });

    it('should have onReceive method on both transports', () => {
      expect(typeof transports.probeTransport.onReceive).toBe('function');
      expect(typeof transports.uiTransport.onReceive).toBe('function');
    });

    it('should have isConnected method on both transports', () => {
      expect(typeof transports.probeTransport.isConnected).toBe('function');
      expect(typeof transports.uiTransport.isConnected).toBe('function');
    });

    it('should have onConnectionChange method on both transports', () => {
      expect(typeof transports.probeTransport.onConnectionChange).toBe('function');
      expect(typeof transports.uiTransport.onConnectionChange).toBe('function');
    });

    it('should have close method on both transports', () => {
      expect(typeof transports.probeTransport.close).toBe('function');
      expect(typeof transports.uiTransport.close).toBe('function');
    });
  });

  describe('connection state', () => {
    it('should start disconnected', () => {
      expect(transports.probeTransport.isConnected()).toBe(false);
      expect(transports.uiTransport.isConnected()).toBe(false);
    });

    it('should become connected when UI starts receiving', () => {
      const handler = vi.fn();
      transports.uiTransport.onReceive(handler);

      expect(transports.probeTransport.isConnected()).toBe(true);
      expect(transports.uiTransport.isConnected()).toBe(true);
    });

    it('should notify connection callbacks when connected', () => {
      const probeCallback = vi.fn();
      const uiCallback = vi.fn();

      transports.probeTransport.onConnectionChange(probeCallback);
      transports.uiTransport.onConnectionChange(uiCallback);

      // Connect by registering UI receiver
      transports.uiTransport.onReceive(() => {});

      expect(probeCallback).toHaveBeenCalledWith(true);
      expect(uiCallback).toHaveBeenCalledWith(true);
    });

    it('should only trigger connection callbacks once', () => {
      const probeCallback = vi.fn();
      transports.probeTransport.onConnectionChange(probeCallback);

      // Register multiple UI receivers
      transports.uiTransport.onReceive(() => {});
      transports.uiTransport.onReceive(() => {});
      transports.uiTransport.onReceive(() => {});

      // Should only be called once
      expect(probeCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('message passing', () => {
    it('should send messages from probe to UI', () => {
      const handler = vi.fn();
      transports.uiTransport.onReceive(handler);

      const message: DebugMessage = {
        type: 'frame-stats',
        payload: { fps: 60 },
      };

      transports.probeTransport.send(message);

      expect(handler).toHaveBeenCalledWith(message);
    });

    it('should send messages from UI to probe', () => {
      const handler = vi.fn();
      transports.probeTransport.onReceive(handler);

      // Connect first
      transports.uiTransport.onReceive(() => {});

      const message: DebugMessage = {
        type: 'select-object',
        payload: { uuid: '123' },
      };

      transports.uiTransport.send(message);

      expect(handler).toHaveBeenCalledWith(message);
    });

    it('should pass messages to multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      transports.uiTransport.onReceive(handler1);
      transports.uiTransport.onReceive(handler2);

      const message: DebugMessage = {
        type: 'frame-stats',
        payload: { fps: 60 },
      };

      transports.probeTransport.send(message);

      expect(handler1).toHaveBeenCalledWith(message);
      expect(handler2).toHaveBeenCalledWith(message);
    });

    it('should handle handler errors gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();

      transports.uiTransport.onReceive(errorHandler);
      transports.uiTransport.onReceive(normalHandler);

      const message: DebugMessage = {
        type: 'frame-stats',
        payload: {},
      };

      // Should not throw
      transports.probeTransport.send(message);

      expect(consoleError).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalledWith(message);

      consoleError.mockRestore();
    });
  });

  describe('unsubscribe', () => {
    it('should allow unsubscribing from receive handlers', () => {
      const handler = vi.fn();
      const unsubscribe = transports.uiTransport.onReceive(handler);

      // Send first message
      transports.probeTransport.send({ type: 'frame-stats', payload: {} });
      expect(handler).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Send second message - should not be received
      transports.probeTransport.send({ type: 'frame-stats', payload: {} });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing from connection callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = transports.probeTransport.onConnectionChange(callback);

      // Unsubscribe before connect
      unsubscribe();

      // Connect
      transports.uiTransport.onReceive(() => {});

      // Should not have been called
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle double unsubscribe gracefully', () => {
      const handler = vi.fn();
      const unsubscribe = transports.uiTransport.onReceive(handler);

      unsubscribe();
      // Should not throw
      unsubscribe();
    });
  });

  describe('close', () => {
    it('should disconnect when probe closes', () => {
      // Connect first
      transports.uiTransport.onReceive(() => {});
      expect(transports.probeTransport.isConnected()).toBe(true);

      // Close
      transports.probeTransport.close();
      expect(transports.probeTransport.isConnected()).toBe(false);
    });

    it('should disconnect when UI closes', () => {
      // Connect first
      transports.uiTransport.onReceive(() => {});
      expect(transports.uiTransport.isConnected()).toBe(true);

      // Close
      transports.uiTransport.close();
      expect(transports.uiTransport.isConnected()).toBe(false);
    });

    it('should notify connection callbacks on close', () => {
      const probeCallback = vi.fn();
      const uiCallback = vi.fn();

      transports.probeTransport.onConnectionChange(probeCallback);
      transports.uiTransport.onConnectionChange(uiCallback);

      // Connect
      transports.uiTransport.onReceive(() => {});
      probeCallback.mockClear();
      uiCallback.mockClear();

      // Close
      transports.probeTransport.close();

      expect(probeCallback).toHaveBeenCalledWith(false);
      expect(uiCallback).toHaveBeenCalledWith(false);
    });
  });

  describe('bidirectional communication', () => {
    it('should support full bidirectional message flow', () => {
      const probeReceiver = vi.fn();
      const uiReceiver = vi.fn();

      transports.probeTransport.onReceive(probeReceiver);
      transports.uiTransport.onReceive(uiReceiver);

      // Probe to UI
      const statsMessage: DebugMessage = {
        type: 'frame-stats',
        payload: { fps: 60 },
      };
      transports.probeTransport.send(statsMessage);
      expect(uiReceiver).toHaveBeenCalledWith(statsMessage);

      // UI to Probe
      const selectMessage: DebugMessage = {
        type: 'select-object',
        payload: { uuid: 'abc123' },
      };
      transports.uiTransport.send(selectMessage);
      expect(probeReceiver).toHaveBeenCalledWith(selectMessage);
    });
  });
});
