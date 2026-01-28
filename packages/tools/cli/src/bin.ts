#!/usr/bin/env node
/**
 * 3Lens CLI
 *
 * Command-line interface for 3Lens.
 *
 * @packageDocumentation
 */

import { parseArgs } from './parser';
import {
  handleRecord,
  handleOpen,
  handleExport,
  handleDiff,
  handleQuery,
  handleValidate,
  handleDoctor,
  handleScaffold,
} from './commands';
import { print, printError, colors } from './utils';
import { CLI_VERSION } from './index';
import type { Command } from './types';

/**
 * CLI commands definition
 */
const commands: Command[] = [
  {
    name: 'trace',
    description: 'Trace recording and management',
    aliases: ['t'],
    subcommands: [
      {
        name: 'record',
        description: 'Record a trace',
        usage: [
          '3lens trace:record --duration 10s --out ./traces/runA.json',
          '3lens trace:record --frames 300 --out ./traces/runA.json',
          '3lens trace:record --until-idle --out ./traces/runA.json',
        ],
        options: [
          { name: 'duration', alias: 'd', type: 'string', description: 'Duration to record (e.g., 10s, 2m)' },
          { name: 'frames', alias: 'f', type: 'number', description: 'Number of frames to record' },
          { name: 'until-idle', type: 'boolean', description: 'Record until frame time stabilizes' },
          { name: 'mode', alias: 'm', type: 'string', description: 'Capture mode (MINIMAL|STANDARD|DEEP)', default: 'STANDARD' },
          { name: 'contexts', type: 'string', description: 'Comma-separated context IDs' },
          { name: 'out', alias: 'o', type: 'string', description: 'Output file path', required: true },
        ],
        handler: handleRecord,
      },
      {
        name: 'open',
        description: 'Open/view a trace',
        usage: [
          '3lens trace:open ./traces/runA.json',
          '3lens trace:open ./traces/runA.json --headless',
        ],
        options: [
          { name: 'headless', type: 'boolean', description: 'Print summary without UI' },
        ],
        handler: handleOpen,
      },
      {
        name: 'export',
        description: 'Export trace with specific profile',
        usage: [
          '3lens trace:export ./traces/runA.json --profile MINIMAL --out ./report.json',
        ],
        options: [
          { name: 'profile', alias: 'p', type: 'string', description: 'Export profile (MINIMAL|STANDARD|FULL|FULL_REDACTED)' },
          { name: 'out', alias: 'o', type: 'string', description: 'Output file path', required: true },
        ],
        handler: handleExport,
      },
    ],
    handler: async (args, options) => {
      printHelp('trace');
      return 0;
    },
  },
  {
    name: 'diff',
    description: 'Compare traces or frames',
    aliases: ['d'],
    usage: [
      '3lens diff traces/runA.json traces/runB.json',
      '3lens diff traces/runA.json traces/runB.json --report ./diff-report.json',
      '3lens diff frames --trace ./trace.json --from 100 --to 200',
    ],
    options: [
      { name: 'report', alias: 'r', type: 'string', description: 'Output report path' },
      { name: 'fail-on-regression', type: 'boolean', description: 'Exit with error on regression' },
      { name: 'trace', type: 'string', description: 'Trace file (for frame diff)' },
      { name: 'from', type: 'number', description: 'Start frame (for frame diff)' },
      { name: 'to', type: 'number', description: 'End frame (for frame diff)' },
    ],
    handler: handleDiff,
  },
  {
    name: 'query',
    description: 'Run analytical queries on traces',
    aliases: ['q'],
    usage: [
      '3lens query top_hotspots ./trace.json --metric gpu_time',
      '3lens query leaks ./trace.json --threshold 300',
      '3lens query shader_variants ./trace.json',
      '3lens query resource_usage ./trace.json --type texture',
    ],
    options: [
      { name: 'window', alias: 'w', type: 'number', description: 'Time window in frames' },
      { name: 'metric', type: 'string', description: 'Metric to analyze' },
      { name: 'limit', alias: 'l', type: 'number', description: 'Result limit', default: 10 },
      { name: 'context', type: 'string', description: 'Context ID filter' },
      { name: 'verbose', alias: 'v', type: 'boolean', description: 'Verbose output' },
      { name: 'threshold', type: 'number', description: 'Threshold for leak detection' },
      { name: 'type', alias: 't', type: 'string', description: 'Resource type filter' },
      { name: 'sort', alias: 's', type: 'string', description: 'Sort field' },
    ],
    handler: handleQuery,
  },
  {
    name: 'validate',
    description: 'Run contract validation',
    aliases: ['v'],
    usage: [
      '3lens validate inspector',
      '3lens validate capture',
      '3lens validate all',
      '3lens validate all --verbose',
    ],
    options: [
      { name: 'verbose', alias: 'v', type: 'boolean', description: 'Verbose output' },
    ],
    handler: handleValidate,
  },
  {
    name: 'doctor',
    description: 'Run diagnostics',
    usage: [
      '3lens doctor',
      '3lens doctor discovery',
      '3lens doctor host',
      '3lens doctor storage',
      '3lens doctor --json',
      '3lens doctor --export ./report.json',
    ],
    options: [
      { name: 'json', type: 'boolean', description: 'Output as JSON' },
      { name: 'export', alias: 'e', type: 'string', description: 'Export to file' },
    ],
    handler: handleDoctor,
  },
  {
    name: 'scaffold',
    description: 'Generate boilerplate code',
    aliases: ['s', 'new'],
    usage: [
      '3lens scaffold panel perf-timeline',
      '3lens scaffold probe texture-upload',
      '3lens scaffold host my-framework',
      '3lens scaffold addon my-company-addon',
    ],
    options: [
      { name: 'addon', alias: 'a', type: 'string', description: 'Target addon (for panel scaffolding)' },
    ],
    handler: handleScaffold,
  },
];

/**
 * Print CLI help
 */
function printHelp(commandName?: string): void {
  if (commandName) {
    const command = commands.find((c) => c.name === commandName);
    if (command) {
      print(`\n${colors.bold}${command.name}${colors.reset} - ${command.description}\n`);

      if (command.usage) {
        print(`${colors.bold}Usage:${colors.reset}`);
        for (const usage of command.usage) {
          print(`  ${usage}`);
        }
        print('');
      }

      if (command.subcommands) {
        print(`${colors.bold}Subcommands:${colors.reset}`);
        for (const sub of command.subcommands) {
          print(`  ${colors.cyan}${commandName}:${sub.name}${colors.reset}  ${sub.description}`);
        }
        print('');
      }

      if (command.options) {
        print(`${colors.bold}Options:${colors.reset}`);
        for (const opt of command.options) {
          const alias = opt.alias ? `-${opt.alias}, ` : '    ';
          const required = opt.required ? ' (required)' : '';
          print(`  ${alias}--${opt.name.padEnd(16)} ${opt.description}${required}`);
        }
        print('');
      }
      return;
    }
  }

  print(`
${colors.bold}3Lens CLI${colors.reset} v${CLI_VERSION}

The definitive developer toolkit for three.js

${colors.bold}Usage:${colors.reset}
  3lens <command> [options]

${colors.bold}Commands:${colors.reset}
  ${colors.cyan}trace:record${colors.reset}     Record a trace
  ${colors.cyan}trace:open${colors.reset}       Open/view a trace
  ${colors.cyan}trace:export${colors.reset}     Export trace with profile
  ${colors.cyan}diff${colors.reset}             Compare traces
  ${colors.cyan}query${colors.reset}            Run analytical queries
  ${colors.cyan}validate${colors.reset}         Run contract validation
  ${colors.cyan}doctor${colors.reset}           Run diagnostics
  ${colors.cyan}scaffold${colors.reset}         Generate boilerplate

${colors.bold}Examples:${colors.reset}
  3lens trace:record --duration 10s --out ./trace.json
  3lens diff ./traceA.json ./traceB.json --fail-on-regression
  3lens query top_hotspots ./trace.json --metric gpu_time
  3lens validate all
  3lens doctor
  3lens scaffold panel perf-timeline

${colors.bold}Options:${colors.reset}
  -h, --help       Show help
  -v, --version    Show version

For more information on a command, run:
  3lens <command> --help
`);
}

/**
 * Print version
 */
function printVersion(): void {
  print(`3lens v${CLI_VERSION}`);
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const parsed = parseArgs(process.argv, commands);

  // Handle global flags
  if (parsed.options.help) {
    printHelp(parsed.command || undefined);
    process.exit(0);
  }

  if (parsed.options.version) {
    printVersion();
    process.exit(0);
  }

  // No command provided
  if (!parsed.command) {
    printHelp();
    process.exit(0);
  }

  // Find command
  let command = commands.find(
    (c) => c.name === parsed.command || c.aliases?.includes(parsed.command)
  );

  // Handle subcommands (e.g., trace:record)
  if (command?.subcommands && parsed.subcommand) {
    const subcommand = command.subcommands.find((s) => s.name === parsed.subcommand);
    if (subcommand) {
      command = subcommand;
    }
  }

  if (!command) {
    printError(`Unknown command: ${parsed.command}`);
    print('\nRun "3lens --help" for available commands.');
    process.exit(1);
  }

  // Check for command help
  if (parsed.options.help) {
    printHelp(parsed.command);
    process.exit(0);
  }

  try {
    const exitCode = await command.handler(parsed.positional, parsed.options);
    process.exit(exitCode);
  } catch (error) {
    printError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run CLI
main();
