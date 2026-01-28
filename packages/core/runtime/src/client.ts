/**
 * Lens Client Interface
 *
 * Client interface for UI communication.
 *
 * @packageDocumentation
 */

import type { Event, EntityId, Node, EntityGraph } from '@3lens/kernel';
import type { Selection } from './types';

/**
 * Lens client interface for UI components
 */
export interface LensClient {
  // Connection
  /** Whether connected to runtime */
  readonly connected: boolean;
  /** Connection mode */
  readonly mode: 'live' | 'offline';

  // Selection
  /** Select entities */
  select(entityIds: EntityId | EntityId[], options?: { source?: string }): void;
  /** Get current selection */
  getSelection(): Selection;
  /** Subscribe to selection changes */
  onSelectionChange(handler: (selection: Selection) => void): () => void;

  // Queries
  /** Execute a query */
  query<T>(name: string, params?: Record<string, unknown>): Promise<QueryResult<T>>;
  /** Execute a query on live data */
  queryLive<T>(name: string, params?: Record<string, unknown>): Promise<QueryResult<T>>;
  /** Execute a query on trace data */
  queryTrace<T>(name: string, params?: Record<string, unknown>): Promise<QueryResult<T>>;

  // Graph
  /** Get the entity graph */
  getGraph(): EntityGraph;
  /** Get a node by ID */
  getNode(id: EntityId): Node | undefined;

  // Events
  /** Subscribe to events */
  onEvent(handler: (event: Event) => void): () => void;

  // Commands
  /** Execute a command */
  executeCommand(command: string, args?: Record<string, unknown>): Promise<void>;

  // Context
  /** Get available contexts */
  getContexts(): ContextInfo[];
  /** Get active context */
  getActiveContext(): ContextInfo | undefined;
  /** Set active context */
  setActiveContext(contextId: string): void;
}

/**
 * Query result from client
 */
export interface QueryResult<T> {
  data: T;
  fidelity: 'EXACT' | 'ESTIMATED' | 'UNAVAILABLE';
  metadata?: {
    executionTimeMs?: number;
    truncated?: boolean;
    totalCount?: number;
  };
}

/**
 * Context info for client
 */
export interface ContextInfo {
  id: string;
  displayName: string;
  active: boolean;
  backend: 'webgl1' | 'webgl2' | 'webgpu';
}
