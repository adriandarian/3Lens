/**
 * @3lens/kernel
 *
 * Core kernel for 3Lens - capture schema, entity graph, query engine, trace format.
 * This package has ZERO dependencies on UI or framework-specific code.
 *
 * @packageDocumentation
 */

// Schema exports
export * from './schema';

// Capture system
export * from './capture';

// Entity graph
export * from './graph';

// Query engine
export * from './query';
export type { QueryResult } from './query/query-engine';
export type { QueryResult as GraphQueryResult } from './schema/entity-graph';

// Trace format
export * from './trace';
export type { TraceStats } from './schema/trace';
export type { TraceStats as TraceManagerStats } from './trace/trace-manager';

// Version
export const KERNEL_VERSION = '1.0.0';
