/**
 * Query Commands
 *
 * Commands for running analytical queries on traces.
 *
 * @packageDocumentation
 */

import type { Trace, Node } from '@3lens/kernel';
import type { QueryOptions, CommandResult } from '../types';
import {
  print,
  printError,
  printInfo,
  printTable,
  readJsonFile,
  fileExists,
  formatBytes,
  colors,
} from '../utils';

/**
 * Query result structure
 */
export interface QueryResult<T = unknown> {
  /** Query name */
  query: string;
  /** Query parameters */
  params: Record<string, unknown>;
  /** Result data */
  data: T[];
  /** Result count */
  count: number;
  /** Execution time in ms */
  executionTime: number;
}

/**
 * Hotspot result
 */
export interface Hotspot {
  entityId: string;
  entityType: string;
  metric: string;
  value: number;
  percentage: number;
}

/**
 * Leak result
 */
export interface Leak {
  entityId: string;
  entityType: string;
  createdFrame: number;
  lastSeenFrame: number;
  age: number;
}

/**
 * Find top performance hotspots
 *
 * @example
 * ```ts
 * import { query } from '@3lens/cli';
 *
 * const result = await query.topHotspots('./trace.json', {
 *   window: 120,
 *   metric: 'gpu_time',
 *   limit: 10,
 * });
 * ```
 */
export async function topHotspots(
  tracePath: string,
  options: QueryOptions = {}
): Promise<CommandResult> {
  const { window = 120, metric = 'gpu_time', limit = 10, context } = options;
  const startTime = performance.now();

  if (!fileExists(tracePath)) {
    printError(`Trace file not found: ${tracePath}`);
    return { exitCode: 1, message: `File not found: ${tracePath}` };
  }

  const trace = readJsonFile<Trace>(tracePath);
  const snapshot = trace.snapshots[trace.snapshots.length - 1];

  if (!snapshot) {
    printError('No snapshots found in trace');
    return { exitCode: 1, message: 'No snapshots' };
  }

  // Filter nodes and calculate costs
  const nodes = snapshot.graph.nodes
    .filter((n) => !context || n.context_id === context)
    .map((n) => ({
      entityId: n.id,
      entityType: n.type,
      metric,
      // TODO: Get actual metric values from events
      value: Math.random() * 100, // Placeholder
      percentage: 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  // Calculate percentages
  const total = nodes.reduce((sum, n) => sum + n.value, 0);
  for (const node of nodes) {
    node.percentage = total > 0 ? (node.value / total) * 100 : 0;
  }

  const executionTime = performance.now() - startTime;

  print(`\n${colors.bold}Top Hotspots (${metric})${colors.reset}`);
  print('─'.repeat(60));

  printTable(
    ['#', 'Entity ID', 'Type', 'Value', '%'],
    nodes.map((n, i) => [
      String(i + 1),
      n.entityId.slice(0, 20),
      n.entityType,
      n.value.toFixed(2),
      `${n.percentage.toFixed(1)}%`,
    ])
  );

  print(`\n${colors.dim}Query executed in ${executionTime.toFixed(2)}ms${colors.reset}`);

  const result: QueryResult<Hotspot> = {
    query: 'top_hotspots',
    params: { window, metric, limit, context },
    data: nodes,
    count: nodes.length,
    executionTime,
  };

  return {
    exitCode: 0,
    message: `Found ${nodes.length} hotspots`,
    data: result,
  };
}

/**
 * Find resource leaks
 *
 * @example
 * ```ts
 * import { query } from '@3lens/cli';
 *
 * const result = await query.leaks('./trace.json', {
 *   threshold: 300,
 * });
 * ```
 */
export async function leaks(
  tracePath: string,
  options: QueryOptions = {}
): Promise<CommandResult> {
  const { threshold = 300, context, verbose } = options;
  const startTime = performance.now();

  if (!fileExists(tracePath)) {
    printError(`Trace file not found: ${tracePath}`);
    return { exitCode: 1, message: `File not found: ${tracePath}` };
  }

  const trace = readJsonFile<Trace>(tracePath);

  // Track entity lifetimes
  const entityLifetimes = new Map<string, { created: number; lastSeen: number; type: string }>();

  // Process events to track creation/disposal
  for (const chunk of trace.events) {
    for (const event of chunk.events) {
      if ('entity_id' in event) {
        const entityId = (event as { entity_id: string }).entity_id;
        const frame = 'frame' in event ? (event as { frame: number }).frame : 0;

        if (event.type === 'entity_create') {
          entityLifetimes.set(entityId, {
            created: frame,
            lastSeen: frame,
            type: (event as { entity_type?: string }).entity_type || 'unknown',
          });
        } else if (event.type === 'entity_dispose') {
          entityLifetimes.delete(entityId);
        } else {
          const lifetime = entityLifetimes.get(entityId);
          if (lifetime) {
            lifetime.lastSeen = frame;
          }
        }
      }
    }
  }

  // Find leaks (entities not disposed within threshold)
  const maxFrame = trace.header.frame_range.end;
  const leakList: Leak[] = [];

  for (const [entityId, lifetime] of entityLifetimes) {
    const age = maxFrame - lifetime.created;
    if (age > threshold) {
      leakList.push({
        entityId,
        entityType: lifetime.type,
        createdFrame: lifetime.created,
        lastSeenFrame: lifetime.lastSeen,
        age,
      });
    }
  }

  leakList.sort((a, b) => b.age - a.age);

  const executionTime = performance.now() - startTime;

  print(`\n${colors.bold}Potential Resource Leaks${colors.reset}`);
  print(`${colors.dim}(Threshold: ${threshold} frames)${colors.reset}`);
  print('─'.repeat(60));

  if (leakList.length === 0) {
    print(`${colors.green}No potential leaks detected${colors.reset}`);
  } else {
    printTable(
      ['Entity ID', 'Type', 'Created', 'Age (frames)'],
      leakList.slice(0, 20).map((l) => [
        l.entityId.slice(0, 20),
        l.entityType,
        String(l.createdFrame),
        `${l.age}`,
      ])
    );

    if (leakList.length > 20) {
      print(`${colors.dim}... and ${leakList.length - 20} more${colors.reset}`);
    }
  }

  print(`\n${colors.dim}Query executed in ${executionTime.toFixed(2)}ms${colors.reset}`);

  const result: QueryResult<Leak> = {
    query: 'leaks',
    params: { threshold, context, verbose },
    data: leakList,
    count: leakList.length,
    executionTime,
  };

  return {
    exitCode: 0,
    message: `Found ${leakList.length} potential leaks`,
    data: result,
  };
}

/**
 * Query shader variants
 */
export async function shaderVariants(
  tracePath: string,
  options: QueryOptions = {}
): Promise<CommandResult> {
  const { limit = 10 } = options;
  const startTime = performance.now();

  if (!fileExists(tracePath)) {
    printError(`Trace file not found: ${tracePath}`);
    return { exitCode: 1, message: `File not found: ${tracePath}` };
  }

  const trace = readJsonFile<Trace>(tracePath);
  const snapshot = trace.snapshots[trace.snapshots.length - 1];

  if (!snapshot) {
    printError('No snapshots found in trace');
    return { exitCode: 1, message: 'No snapshots' };
  }

  // Find shader nodes
  const shaders = snapshot.graph.nodes
    .filter((n) => n.type === 'Shader' || n.type === 'ShaderMaterial')
    .slice(0, limit);

  const executionTime = performance.now() - startTime;

  print(`\n${colors.bold}Shader Variants${colors.reset}`);
  print('─'.repeat(60));

  if (shaders.length === 0) {
    print('No shaders found');
  } else {
    printTable(
      ['Shader ID', 'Type', 'Properties'],
      shaders.map((s) => [
        s.id.slice(0, 20),
        s.type,
        Object.keys(s.properties || {}).length.toString(),
      ])
    );
  }

  print(`\n${colors.dim}Query executed in ${executionTime.toFixed(2)}ms${colors.reset}`);

  return {
    exitCode: 0,
    message: `Found ${shaders.length} shaders`,
    data: { query: 'shader_variants', data: shaders, count: shaders.length, executionTime },
  };
}

/**
 * Query resource usage
 */
export async function resourceUsage(
  tracePath: string,
  options: QueryOptions = {}
): Promise<CommandResult> {
  const { type, sort = 'count', limit = 20 } = options;
  const startTime = performance.now();

  if (!fileExists(tracePath)) {
    printError(`Trace file not found: ${tracePath}`);
    return { exitCode: 1, message: `File not found: ${tracePath}` };
  }

  const trace = readJsonFile<Trace>(tracePath);
  const snapshot = trace.snapshots[trace.snapshots.length - 1];

  if (!snapshot) {
    printError('No snapshots found in trace');
    return { exitCode: 1, message: 'No snapshots' };
  }

  // Group by type
  const byType = new Map<string, Node[]>();
  for (const node of snapshot.graph.nodes) {
    if (type && node.type.toLowerCase() !== type.toLowerCase()) continue;

    const nodes = byType.get(node.type) || [];
    nodes.push(node);
    byType.set(node.type, nodes);
  }

  const executionTime = performance.now() - startTime;

  print(`\n${colors.bold}Resource Usage${colors.reset}`);
  if (type) {
    print(`${colors.dim}(Filtered by type: ${type})${colors.reset}`);
  }
  print('─'.repeat(60));

  const rows = Array.from(byType.entries())
    .map(([t, nodes]) => ({
      type: t,
      count: nodes.length,
      // Estimate size from properties
      size: nodes.reduce((sum, n) => sum + JSON.stringify(n.properties || {}).length, 0),
    }))
    .sort((a, b) => (sort === 'size' ? b.size - a.size : b.count - a.count))
    .slice(0, limit);

  printTable(
    ['Type', 'Count', 'Est. Size'],
    rows.map((r) => [r.type, String(r.count), formatBytes(r.size)])
  );

  print(`\n${colors.dim}Query executed in ${executionTime.toFixed(2)}ms${colors.reset}`);

  return {
    exitCode: 0,
    message: `Found ${byType.size} resource types`,
    data: { query: 'resource_usage', data: rows, count: rows.length, executionTime },
  };
}

/**
 * CLI handler for query command
 */
export async function handleQuery(
  args: string[],
  options: Record<string, unknown>
): Promise<number> {
  if (args.length === 0) {
    printError('Usage: 3lens query <query_name> [--options]');
    print('\nAvailable queries:');
    print('  top_hotspots  - Find top performance hotspots');
    print('  leaks         - Find resource leaks');
    print('  shader_variants - List shader variants');
    print('  resource_usage - Analyze resource usage');
    return 1;
  }

  const queryName = args[0];
  const tracePath = args[1] || (options.trace as string);

  if (!tracePath) {
    printError('Must specify trace file path');
    return 1;
  }

  const queryOptions: QueryOptions = {
    window: options.window as number,
    metric: options.metric as QueryOptions['metric'],
    limit: options.limit as number,
    context: options.context as string,
    verbose: options.verbose as boolean,
    threshold: options.threshold as number,
    type: options.type as string,
    sort: options.sort as string,
  };

  let result: CommandResult;

  switch (queryName) {
    case 'top_hotspots':
      result = await topHotspots(tracePath, queryOptions);
      break;
    case 'leaks':
      result = await leaks(tracePath, queryOptions);
      break;
    case 'shader_variants':
      result = await shaderVariants(tracePath, queryOptions);
      break;
    case 'resource_usage':
      result = await resourceUsage(tracePath, queryOptions);
      break;
    default:
      printError(`Unknown query: ${queryName}`);
      return 1;
  }

  return result.exitCode;
}
