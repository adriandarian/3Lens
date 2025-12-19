import type { Unsubscribe } from './common';
import type { FrameStats } from './stats';
import type { SceneSnapshot } from './snapshot';
import type { ObjectMeta, LogicalEntity } from './objects';

/**
 * Transport interface for probe-UI communication
 */
export interface Transport {
  /**
   * Send a message to the devtool UI
   */
  send(message: DebugMessage): void;

  /**
   * Receive messages from the devtool UI
   */
  onReceive(handler: (message: DebugMessage) => void): Unsubscribe;

  /**
   * Connection status
   */
  isConnected(): boolean;

  /**
   * Subscribe to connection changes
   */
  onConnectionChange(handler: (connected: boolean) => void): Unsubscribe;

  /**
   * Close the transport
   */
  close(): void;
}

/**
 * All possible debug message types
 */
export type DebugMessage =
  // Handshake
  | HandshakeRequest
  | HandshakeResponse
  // Data messages
  | FrameStatsMessage
  | SnapshotMessage
  | SelectionChangedMessage
  // Command messages
  | SelectObjectCommand
  | HoverObjectCommand
  | RequestSnapshotCommand
  | PingCommand
  | PongMessage;

/**
 * Base message interface
 */
interface BaseMessage {
  type: string;
  id?: string;
  timestamp: number;
}

/**
 * Handshake request from UI
 */
export interface HandshakeRequest extends BaseMessage {
  type: 'handshake-request';
  uiVersion: string;
  capabilities: string[];
}

/**
 * Handshake response from probe
 */
export interface HandshakeResponse extends BaseMessage {
  type: 'handshake-response';
  requestId: string;
  appId: string;
  appName: string;
  threeVersion: string;
  probeVersion: string;
  backend: 'webgl' | 'webgpu';
  capabilities: string[];
}

/**
 * Frame stats message
 */
export interface FrameStatsMessage extends BaseMessage {
  type: 'frame-stats';
  stats: FrameStats;
}

/**
 * Scene snapshot message
 */
export interface SnapshotMessage extends BaseMessage {
  type: 'snapshot';
  snapshotId: string;
  trigger: 'manual' | 'on-change' | 'scheduled';
  snapshot: SceneSnapshot;
}

/**
 * Selection changed message
 */
export interface SelectionChangedMessage extends BaseMessage {
  type: 'selection-changed';
  selectedObject: ObjectMeta | null;
  previousObject: ObjectMeta | null;
}

/**
 * Select object command
 */
export interface SelectObjectCommand extends BaseMessage {
  type: 'select-object';
  debugId: string | null;
}

/**
 * Hover object command (for highlighting on hover)
 */
export interface HoverObjectCommand extends BaseMessage {
  type: 'hover-object';
  debugId: string | null;
}

/**
 * Request snapshot command
 */
export interface RequestSnapshotCommand extends BaseMessage {
  type: 'request-snapshot';
}

/**
 * Ping command for health check
 */
export interface PingCommand extends BaseMessage {
  type: 'ping';
}

/**
 * Pong response to ping
 */
export interface PongMessage extends BaseMessage {
  type: 'pong';
  requestId: string;
}

