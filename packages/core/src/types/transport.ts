import type { Unsubscribe } from './common';
import type { FrameStats } from './stats';
import type { SceneSnapshot } from './snapshot';
import type { ObjectMeta } from './objects';

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
  | UpdateMaterialPropertyCommand
  | GeometryVisualizationCommand
  | PingCommand
  | PongMessage
  // Custom messages
  | CustomMetricMessage
  | CustomEventMessage;

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
 * Update a material property command
 */
export interface UpdateMaterialPropertyCommand extends BaseMessage {
  type: 'update-material-property';
  /**
   * Material UUID to update
   */
  materialUuid: string;
  /**
   * Property path (e.g., 'color', 'opacity', 'roughness')
   */
  property: string;
  /**
   * New value for the property
   */
  value: unknown;
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

/**
 * Custom metric message
 */
export interface CustomMetricMessage extends BaseMessage {
  type: 'custom-metric';
  name: string;
  value: number;
  tags?: Record<string, string>;
}

/**
 * Custom event message
 */
export interface CustomEventMessage extends BaseMessage {
  type: 'custom-event';
  name: string;
  data?: Record<string, unknown>;
}

/**
 * Geometry visualization command
 */
export interface GeometryVisualizationCommand extends BaseMessage {
  type: 'geometry-visualization';
  geometryUuid: string;
  visualization: 'wireframe' | 'boundingBox' | 'normals';
  enabled: boolean;
}

