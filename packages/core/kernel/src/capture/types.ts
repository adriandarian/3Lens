/**
 * Capture System Types
 *
 * @packageDocumentation
 */

import type { Event, CaptureMode, Fidelity } from '../schema/events';

/**
 * Capture context configuration
 */
export interface CaptureContextConfig {
  /** Context identifier */
  id: string;
  /** Capture mode */
  mode: CaptureMode;
  /** Buffer size in bytes */
  bufferSizeBytes: number;
  /** Auto-degrade when under pressure */
  autoDegrade: boolean;
  /** Overhead budget in ms per frame */
  overheadBudgetMs: number;
}

/**
 * Capture context interface
 */
export interface CaptureContext {
  /** Context ID */
  readonly id: string;
  /** Current capture mode */
  readonly mode: CaptureMode;
  /** Current sequence number */
  readonly seq: number;
  /** Whether capture is active */
  readonly active: boolean;

  /** Emit an event */
  emit(event: Omit<Event, 'seq' | 'context_id'>): void;

  /** Start capture */
  start(): void;

  /** Stop capture */
  stop(): void;

  /** Get current overhead metrics */
  getOverheadMetrics(): OverheadMetrics;

  /** Subscribe to events */
  subscribe(handler: EventHandler): Unsubscribe;
}

/**
 * Event handler function
 */
export type EventHandler = (event: Event) => void;

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => void;

/**
 * Overhead metrics
 */
export interface OverheadMetrics {
  /** Time spent in capture per frame (ms) */
  captureTimeMs: number;
  /** Events per second */
  eventRate: number;
  /** Current buffer usage (bytes) */
  bufferUsedBytes: number;
  /** Total buffer capacity (bytes) */
  bufferCapacityBytes: number;
  /** Number of events dropped */
  dropCount: number;
  /** Current capture mode */
  currentMode: CaptureMode;
}

/**
 * Auto-degrade trigger configuration
 */
export interface DegradeTriggers {
  /** Degrade if capture overhead exceeds this per frame */
  frameOverheadMs: number;
  /** Degrade if event rate exceeds this per second */
  eventRatePerSec: number;
  /** Degrade if buffer usage exceeds this percentage */
  bufferUsagePercent: number;
}

/**
 * Default degrade triggers
 */
export const DEFAULT_DEGRADE_TRIGGERS: DegradeTriggers = {
  frameOverheadMs: 2,
  eventRatePerSec: 10000,
  bufferUsagePercent: 80,
};
