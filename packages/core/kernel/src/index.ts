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

// Trace format
export * from './trace';

// Version
export const KERNEL_VERSION = '1.0.0';
