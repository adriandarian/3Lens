/**
 * Core Runtime Types
 *
 * @packageDocumentation
 */

import type { Fidelity, CaptureMode, Event } from '@3lens/kernel';
import type { EntityGraph, EntityId, Node } from '@3lens/kernel';

/**
 * Selection model
 */
export interface Selection {
  /** Selected entity IDs */
  entity_ids: EntityId[];
  /** Context ID (or 'all' for cross-context) */
  context_id: string;
  /** Source of selection */
  source: SelectionSource;
  /** When selected */
  timestamp: number;
}

export type SelectionSource =
  | 'user_click'
  | 'query_result'
  | 'hotspot_navigation'
  | 'diff_highlight'
  | 'timeline_event'
  | 'external';

/**
 * UI surface mode
 */
export type UISurface = 'overlay' | 'dock' | 'window' | 'extension';

/**
 * Discovery mode
 */
export type DiscoveryMode = 'off' | 'observe' | 'hook';

/**
 * Export profile
 */
export type ExportProfile = 'MINIMAL' | 'STANDARD' | 'FULL' | 'FULL_REDACTED';

/**
 * Support tier for three.js versions
 */
export type SupportTier = 'SUPPORTED' | 'COMPATIBLE' | 'UNKNOWN';

/**
 * Backend type
 */
export type Backend = 'webgl1' | 'webgl2' | 'webgpu';
