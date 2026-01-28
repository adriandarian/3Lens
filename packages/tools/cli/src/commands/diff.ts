/**
 * Diff Commands
 *
 * Commands for comparing traces and frames.
 *
 * @packageDocumentation
 */

import type { Trace, Node, Edge } from '@3lens/kernel';
import type { DiffOptions, CommandResult } from '../types';
import {
  print,
  printError,
  printSuccess,
  printInfo,
  printWarning,
  printTable,
  readJsonFile,
  writeJsonFile,
  fileExists,
  formatBytes,
  colors,
} from '../utils';

/**
 * Diff result structure
 */
export interface TraceDiff {
  /** Metadata about the comparison */
  meta: {
    traceA: string;
    traceB: string;
    timestamp: string;
  };
  /** Entity graph changes */
  graph: {
    added: { nodes: Node[]; edges: Edge[] };
    removed: { nodes: Node[]; edges: Edge[] };
    modified: { nodeId: string; changes: Record<string, { before: unknown; after: unknown }> }[];
  };
  /** Cost delta */
  cost: {
    gpuTime: { before: number; after: number; delta: number };
    cpuTime: { before: number; after: number; delta: number };
    memory: { before: number; after: number; delta: number };
    drawCalls: { before: number; after: number; delta: number };
    triangles: { before: number; after: number; delta: number };
  };
  /** Summary statistics */
  summary: {
    addedNodes: number;
    removedNodes: number;
    modifiedNodes: number;
    addedEdges: number;
    removedEdges: number;
    isRegression: boolean;
    regressionReasons: string[];
  };
}

/**
 * Compare two traces
 *
 * @example
 * ```ts
 * import { diff } from '@3lens/cli';
 *
 * const result = await diff.traces('traceA.json', 'traceB.json');
 * console.log(result.summary);
 * ```
 */
export async function traces(
  traceAPath: string,
  traceBPath: string,
  options: DiffOptions = {}
): Promise<CommandResult> {
  const { report, failOnRegression } = options;

  // Validate files exist
  if (!fileExists(traceAPath)) {
    printError(`Trace file not found: ${traceAPath}`);
    return { exitCode: 1, message: `File not found: ${traceAPath}` };
  }

  if (!fileExists(traceBPath)) {
    printError(`Trace file not found: ${traceBPath}`);
    return { exitCode: 1, message: `File not found: ${traceBPath}` };
  }

  printInfo(`Comparing traces:`);
  printInfo(`  A: ${traceAPath}`);
  printInfo(`  B: ${traceBPath}`);

  const traceA = readJsonFile<Trace>(traceAPath);
  const traceB = readJsonFile<Trace>(traceBPath);

  // Compare snapshots
  const snapshotA = traceA.snapshots[traceA.snapshots.length - 1]?.graph;
  const snapshotB = traceB.snapshots[traceB.snapshots.length - 1]?.graph;

  const nodesA = new Map((snapshotA?.nodes || []).map((n) => [n.id, n]));
  const nodesB = new Map((snapshotB?.nodes || []).map((n) => [n.id, n]));
  const edgesA = new Map((snapshotA?.edges || []).map((e) => [`${e.source}-${e.target}`, e]));
  const edgesB = new Map((snapshotB?.edges || []).map((e) => [`${e.source}-${e.target}`, e]));

  // Find added/removed/modified nodes
  const addedNodes: Node[] = [];
  const removedNodes: Node[] = [];
  const modifiedNodes: { nodeId: string; changes: Record<string, { before: unknown; after: unknown }> }[] = [];

  for (const [id, node] of nodesB) {
    if (!nodesA.has(id)) {
      addedNodes.push(node);
    } else {
      // Check for modifications
      const nodeA = nodesA.get(id)!;
      const changes: Record<string, { before: unknown; after: unknown }> = {};

      // Compare properties
      const allKeys = new Set([
        ...Object.keys(nodeA.properties || {}),
        ...Object.keys(node.properties || {}),
      ]);

      for (const key of allKeys) {
        const before = nodeA.properties?.[key];
        const after = node.properties?.[key];
        if (JSON.stringify(before) !== JSON.stringify(after)) {
          changes[key] = { before, after };
        }
      }

      if (Object.keys(changes).length > 0) {
        modifiedNodes.push({ nodeId: id, changes });
      }
    }
  }

  for (const [id, node] of nodesA) {
    if (!nodesB.has(id)) {
      removedNodes.push(node);
    }
  }

  // Find added/removed edges
  const addedEdges: Edge[] = [];
  const removedEdges: Edge[] = [];

  for (const [key, edge] of edgesB) {
    if (!edgesA.has(key)) {
      addedEdges.push(edge);
    }
  }

  for (const [key, edge] of edgesA) {
    if (!edgesB.has(key)) {
      removedEdges.push(edge);
    }
  }

  // Calculate cost deltas
  const statsA = traceA.header.stats;
  const statsB = traceB.header.stats;

  // Determine regression
  const regressionReasons: string[] = [];

  if (statsB.node_count > statsA.node_count * 1.1) {
    regressionReasons.push(`Node count increased by ${((statsB.node_count / statsA.node_count - 1) * 100).toFixed(1)}%`);
  }

  if (statsB.event_count > statsA.event_count * 1.2) {
    regressionReasons.push(`Event count increased by ${((statsB.event_count / statsA.event_count - 1) * 100).toFixed(1)}%`);
  }

  const diff: TraceDiff = {
    meta: {
      traceA: traceAPath,
      traceB: traceBPath,
      timestamp: new Date().toISOString(),
    },
    graph: {
      added: { nodes: addedNodes, edges: addedEdges },
      removed: { nodes: removedNodes, edges: removedEdges },
      modified: modifiedNodes,
    },
    cost: {
      gpuTime: { before: 0, after: 0, delta: 0 },
      cpuTime: { before: 0, after: 0, delta: 0 },
      memory: { before: statsA.uncompressed_bytes, after: statsB.uncompressed_bytes, delta: statsB.uncompressed_bytes - statsA.uncompressed_bytes },
      drawCalls: { before: 0, after: 0, delta: 0 },
      triangles: { before: 0, after: 0, delta: 0 },
    },
    summary: {
      addedNodes: addedNodes.length,
      removedNodes: removedNodes.length,
      modifiedNodes: modifiedNodes.length,
      addedEdges: addedEdges.length,
      removedEdges: removedEdges.length,
      isRegression: regressionReasons.length > 0,
      regressionReasons,
    },
  };

  // Print summary
  print(`\n${colors.bold}Diff Summary${colors.reset}`);
  print('─'.repeat(40));

  printTable(
    ['Metric', 'Before', 'After', 'Delta'],
    [
      ['Nodes', String(statsA.node_count), String(statsB.node_count), formatDelta(statsB.node_count - statsA.node_count)],
      ['Edges', String(statsA.edge_count), String(statsB.edge_count), formatDelta(statsB.edge_count - statsA.edge_count)],
      ['Events', String(statsA.event_count), String(statsB.event_count), formatDelta(statsB.event_count - statsA.event_count)],
      ['Frames', String(statsA.frame_count), String(statsB.frame_count), formatDelta(statsB.frame_count - statsA.frame_count)],
      ['Size', formatBytes(statsA.uncompressed_bytes), formatBytes(statsB.uncompressed_bytes), formatDelta(statsB.uncompressed_bytes - statsA.uncompressed_bytes, true)],
    ]
  );

  print(`\n${colors.bold}Entity Changes${colors.reset}`);
  print('─'.repeat(40));
  print(`  Added nodes:    ${colors.green}+${addedNodes.length}${colors.reset}`);
  print(`  Removed nodes:  ${colors.red}-${removedNodes.length}${colors.reset}`);
  print(`  Modified nodes: ${colors.yellow}~${modifiedNodes.length}${colors.reset}`);
  print(`  Added edges:    ${colors.green}+${addedEdges.length}${colors.reset}`);
  print(`  Removed edges:  ${colors.red}-${removedEdges.length}${colors.reset}`);

  if (regressionReasons.length > 0) {
    print(`\n${colors.bold}${colors.red}Regression Detected${colors.reset}`);
    print('─'.repeat(40));
    for (const reason of regressionReasons) {
      printWarning(reason);
    }
  }

  // Write report if requested
  if (report) {
    writeJsonFile(report, diff);
    printSuccess(`Report saved to: ${report}`);
  }

  // Exit with error if regression detected and fail flag is set
  if (failOnRegression && diff.summary.isRegression) {
    return {
      exitCode: 1,
      message: 'Regression detected',
      data: diff,
    };
  }

  return {
    exitCode: 0,
    message: 'Diff complete',
    data: diff,
  };
}

/**
 * Compare frames within a trace
 */
export async function frames(
  tracePath: string,
  options: { from: number; to: number }
): Promise<CommandResult> {
  const { from, to } = options;

  if (!fileExists(tracePath)) {
    printError(`Trace file not found: ${tracePath}`);
    return { exitCode: 1, message: `File not found: ${tracePath}` };
  }

  const trace = readJsonFile<Trace>(tracePath);

  printInfo(`Comparing frames ${from} to ${to} in ${tracePath}`);

  // Find snapshots closest to the specified frames
  const snapshotFrom = trace.snapshots.find((s) => s.frame >= from);
  const snapshotTo = trace.snapshots.find((s) => s.frame >= to);

  if (!snapshotFrom || !snapshotTo) {
    printError('Could not find snapshots for the specified frame range');
    return { exitCode: 1, message: 'Snapshots not found' };
  }

  printInfo(`Using snapshots at frames ${snapshotFrom.frame} and ${snapshotTo.frame}`);

  // TODO: Implement detailed frame comparison
  printInfo('(Detailed frame comparison not yet implemented)');

  return {
    exitCode: 0,
    message: 'Frame diff complete',
  };
}

/**
 * Format a delta value with color
 */
function formatDelta(delta: number, isBytes = false): string {
  const formatted = isBytes ? formatBytes(Math.abs(delta)) : String(Math.abs(delta));

  if (delta > 0) {
    return `${colors.red}+${formatted}${colors.reset}`;
  } else if (delta < 0) {
    return `${colors.green}-${formatted}${colors.reset}`;
  }
  return formatted;
}

/**
 * CLI handler for diff command
 */
export async function handleDiff(
  args: string[],
  options: Record<string, unknown>
): Promise<number> {
  // Check for frames subcommand
  if (args[0] === 'frames') {
    const tracePath = options.trace as string;
    const from = options.from as number;
    const to = options.to as number;

    if (!tracePath || from === undefined || to === undefined) {
      printError('Usage: 3lens diff frames --trace <path> --from <frame> --to <frame>');
      return 1;
    }

    const result = await frames(tracePath, { from, to });
    return result.exitCode;
  }

  // Default: compare two traces
  if (args.length < 2) {
    printError('Usage: 3lens diff <traceA> <traceB> [--report <path>] [--fail-on-regression]');
    return 1;
  }

  const result = await traces(args[0], args[1], {
    report: options.report as string,
    failOnRegression: options['fail-on-regression'] as boolean,
  });

  return result.exitCode;
}
