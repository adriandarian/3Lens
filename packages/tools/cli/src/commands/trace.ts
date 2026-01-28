/**
 * Trace Commands
 *
 * Commands for trace recording, opening, and exporting.
 *
 * @packageDocumentation
 */

import type { Trace } from '@3lens/kernel';
import type { TraceRecordOptions, TraceOpenOptions, CommandResult } from '../types';
import { parseDuration, parseFrames } from '../parser';
import {
  print,
  printError,
  printSuccess,
  printInfo,
  printTable,
  readJsonFile,
  writeJsonFile,
  fileExists,
  formatBytes,
  formatDuration,
  Spinner,
  colors,
} from '../utils';

/**
 * Record a trace
 *
 * @example
 * ```ts
 * import { trace } from '@3lens/cli';
 *
 * await trace.record({
 *   duration: 10,
 *   out: './traces/runA.json',
 *   mode: 'STANDARD',
 * });
 * ```
 */
export async function record(options: TraceRecordOptions): Promise<CommandResult> {
  const {
    duration,
    frames,
    untilIdle,
    mode = 'STANDARD',
    contexts,
    out,
  } = options;

  // Validate options
  if (!duration && !frames && !untilIdle) {
    return {
      exitCode: 1,
      message: 'Must specify --duration, --frames, or --until-idle',
    };
  }

  if (!out) {
    return {
      exitCode: 1,
      message: 'Must specify --out <path>',
    };
  }

  printInfo(`Recording trace with mode: ${mode}`);

  if (duration) {
    printInfo(`Duration: ${duration}s`);
  } else if (frames) {
    printInfo(`Frames: ${frames}`);
  } else if (untilIdle) {
    printInfo('Recording until idle...');
  }

  if (contexts?.length) {
    printInfo(`Contexts: ${contexts.join(', ')}`);
  }

  // TODO: Implement actual trace recording with browser/puppeteer
  // For now, create a stub trace

  const spinner = new Spinner('Recording trace...');
  spinner.start();

  // Simulate recording
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const trace: Trace = {
    version: '1.0.0',
    header: {
      session_id: crypto.randomUUID(),
      kernel_version: '1.0.0',
      export_profile: 'STANDARD',
      capture_mode: mode,
      time_range: { start: Date.now() - 10000, end: Date.now() },
      frame_range: { start: 0, end: frames || 300 },
      contexts: contexts?.map((id) => ({
        id,
        display_name: id,
        discovery: 'manual' as const,
        discovery_fidelity: 'EXACT' as const,
        backend: 'WebGL2',
      })) || [],
      environment: {
        user_agent: 'CLI',
        three_version: '0.182.0',
        backend: 'WebGL2',
      },
      stats: {
        event_count: 0,
        events_by_type: {},
        node_count: 0,
        nodes_by_type: {},
        edge_count: 0,
        frame_count: frames || 300,
        snapshot_count: 1,
        chunk_count: 0,
        compressed_bytes: 0,
        uncompressed_bytes: 0,
      },
    },
    dictionary: {
      strings: [],
      entity_ids: [],
      property_keys: [],
      event_types: [],
    },
    snapshots: [],
    events: [],
  };

  writeJsonFile(out, trace);

  spinner.stop();
  printSuccess(`Trace saved to: ${out}`);

  return {
    exitCode: 0,
    message: `Trace recorded to ${out}`,
    data: trace,
  };
}

/**
 * Open/view a trace
 *
 * @example
 * ```ts
 * import { trace } from '@3lens/cli';
 *
 * await trace.open('./traces/runA.json', { headless: false });
 * ```
 */
export async function open(
  tracePath: string,
  options: TraceOpenOptions = {}
): Promise<CommandResult> {
  const { headless } = options;

  if (!fileExists(tracePath)) {
    printError(`Trace file not found: ${tracePath}`);
    return { exitCode: 1, message: `File not found: ${tracePath}` };
  }

  const trace = readJsonFile<Trace>(tracePath);

  if (headless) {
    // Print trace summary
    print(`\n${colors.bold}Trace Summary${colors.reset}`);
    print('─'.repeat(40));
    printTable(
      ['Property', 'Value'],
      [
        ['Session ID', trace.header.session_id],
        ['Export Profile', trace.header.export_profile],
        ['Capture Mode', trace.header.capture_mode],
        ['Frames', `${trace.header.frame_range.start} - ${trace.header.frame_range.end}`],
        ['Events', String(trace.header.stats.event_count)],
        ['Nodes', String(trace.header.stats.node_count)],
        ['Snapshots', String(trace.header.stats.snapshot_count)],
        ['Size', formatBytes(trace.header.stats.uncompressed_bytes)],
      ]
    );

    if (trace.header.contexts.length > 0) {
      print(`\n${colors.bold}Contexts${colors.reset}`);
      print('─'.repeat(40));
      for (const ctx of trace.header.contexts) {
        print(`  ${ctx.id}: ${ctx.display_name} (${ctx.backend})`);
      }
    }

    return {
      exitCode: 0,
      message: 'Trace loaded',
      data: trace,
    };
  }

  // TODO: Open trace viewer UI
  printInfo('Opening trace viewer...');
  printInfo('(Trace viewer UI not yet implemented)');

  return {
    exitCode: 0,
    message: 'Trace viewer opened',
    data: trace,
  };
}

/**
 * Export a trace with a specific profile
 *
 * @example
 * ```ts
 * import { trace } from '@3lens/cli';
 *
 * await trace.export('./traces/runA.json', {
 *   profile: 'MINIMAL',
 *   out: './report.json',
 * });
 * ```
 */
export async function exportTrace(
  tracePath: string,
  options: { profile?: string; out: string }
): Promise<CommandResult> {
  const { profile = 'STANDARD', out } = options;

  if (!fileExists(tracePath)) {
    printError(`Trace file not found: ${tracePath}`);
    return { exitCode: 1, message: `File not found: ${tracePath}` };
  }

  const trace = readJsonFile<Trace>(tracePath);

  // Apply export profile
  const exportedTrace: Trace = {
    ...trace,
    header: {
      ...trace.header,
      export_profile: profile as 'MINIMAL' | 'STANDARD' | 'FULL' | 'FULL_REDACTED',
    },
  };

  // Remove data based on profile
  if (profile === 'MINIMAL') {
    exportedTrace.events = [];
    exportedTrace.snapshots = trace.snapshots.slice(0, 1);
  }

  writeJsonFile(out, exportedTrace);
  printSuccess(`Exported trace with profile ${profile} to: ${out}`);

  return {
    exitCode: 0,
    message: `Trace exported to ${out}`,
    data: exportedTrace,
  };
}

/**
 * CLI handler for trace:record
 */
export async function handleRecord(
  args: string[],
  options: Record<string, unknown>
): Promise<number> {
  const recordOptions: TraceRecordOptions = {
    out: options.out as string,
    mode: options.mode as 'MINIMAL' | 'STANDARD' | 'DEEP',
    contexts: options.contexts ? String(options.contexts).split(',') : undefined,
  };

  if (options.duration) {
    recordOptions.duration = typeof options.duration === 'number'
      ? options.duration
      : parseDuration(String(options.duration));
  }

  if (options.frames) {
    recordOptions.frames = typeof options.frames === 'number'
      ? options.frames
      : parseFrames(String(options.frames));
  }

  if (options['until-idle']) {
    recordOptions.untilIdle = true;
  }

  const result = await record(recordOptions);
  return result.exitCode;
}

/**
 * CLI handler for trace:open
 */
export async function handleOpen(
  args: string[],
  options: Record<string, unknown>
): Promise<number> {
  if (args.length === 0) {
    printError('Must specify trace file path');
    return 1;
  }

  const result = await open(args[0], {
    headless: options.headless as boolean,
  });

  return result.exitCode;
}

/**
 * CLI handler for trace:export
 */
export async function handleExport(
  args: string[],
  options: Record<string, unknown>
): Promise<number> {
  if (args.length === 0) {
    printError('Must specify trace file path');
    return 1;
  }

  if (!options.out) {
    printError('Must specify --out <path>');
    return 1;
  }

  const result = await exportTrace(args[0], {
    profile: options.profile as string,
    out: options.out as string,
  });

  return result.exitCode;
}
