/**
 * Query Engine Implementation
 *
 * @packageDocumentation
 */

import type { EntityGraph, Node, EntityId } from '../schema/entity-graph';
import type { Fidelity } from '../schema/events';

/**
 * Query definition
 */
export interface Query<TParams = unknown, TResult = unknown> {
  /** Query name */
  name: string;
  /** Query description */
  description: string;
  /** Execute the query */
  execute(graph: EntityGraph, params: TParams): QueryResult<TResult>;
}

/**
 * Query result
 */
export interface QueryResult<T = unknown> {
  /** Result data */
  data: T;
  /** Data fidelity */
  fidelity: Fidelity;
  /** Metadata */
  metadata?: QueryMetadata;
}

/**
 * Query metadata
 */
export interface QueryMetadata {
  /** Execution time in ms */
  executionTimeMs?: number;
  /** Whether results were truncated */
  truncated?: boolean;
  /** Total count before truncation */
  totalCount?: number;
  /** Contexts queried */
  contexts?: string[];
}

/**
 * Query registry
 */
export interface QueryRegistry {
  /** Register a query */
  register<TParams, TResult>(query: Query<TParams, TResult>): void;

  /** Unregister a query */
  unregister(name: string): void;

  /** Get a query by name */
  get<TParams = unknown, TResult = unknown>(name: string): Query<TParams, TResult> | undefined;

  /** List all registered queries */
  list(): string[];

  /** Execute a query by name */
  execute<TParams, TResult>(
    name: string,
    graph: EntityGraph,
    params: TParams
  ): QueryResult<TResult> | undefined;
}

/**
 * Create a query registry
 */
export function createQueryRegistry(): QueryRegistry {
  const queries = new Map<string, Query<unknown, unknown>>();

  return {
    register<TParams, TResult>(query: Query<TParams, TResult>): void {
      queries.set(query.name, query as Query<unknown, unknown>);
    },

    unregister(name: string): void {
      queries.delete(name);
    },

    get<TParams = unknown, TResult = unknown>(name: string): Query<TParams, TResult> | undefined {
      return queries.get(name) as Query<TParams, TResult> | undefined;
    },

    list(): string[] {
      return Array.from(queries.keys());
    },

    execute<TParams, TResult>(
      name: string,
      graph: EntityGraph,
      params: TParams
    ): QueryResult<TResult> | undefined {
      const query = queries.get(name);
      if (!query) return undefined;

      const startTime = performance.now();
      const result = query.execute(graph, params) as QueryResult<TResult>;
      const executionTimeMs = performance.now() - startTime;

      return {
        ...result,
        metadata: {
          ...result.metadata,
          executionTimeMs,
        },
      };
    },
  };
}

/**
 * Helper to create a query
 */
export function defineQuery<TParams, TResult>(
  name: string,
  description: string,
  execute: (graph: EntityGraph, params: TParams) => QueryResult<TResult>
): Query<TParams, TResult> {
  return { name, description, execute };
}
