/**
 * CLI Argument Parser
 *
 * Lightweight argument parser for the 3Lens CLI.
 *
 * @packageDocumentation
 */

import type { ParsedArgs, Command, CommandOption } from './types';

/**
 * Parse command line arguments
 */
export function parseArgs(argv: string[], commands: Command[]): ParsedArgs {
  const args = argv.slice(2); // Remove node and script path
  const result: ParsedArgs = {
    command: '',
    positional: [],
    options: {},
  };

  if (args.length === 0) {
    return result;
  }

  // First argument is the command
  const firstArg = args[0];

  // Check if it's a flag (help/version)
  if (firstArg === '--help' || firstArg === '-h') {
    result.options.help = true;
    return result;
  }

  if (firstArg === '--version' || firstArg === '-v') {
    result.options.version = true;
    return result;
  }

  // Parse command (may contain subcommand with :)
  const commandParts = firstArg.split(':');
  result.command = commandParts[0];
  if (commandParts.length > 1) {
    result.subcommand = commandParts.slice(1).join(':');
  }

  // Find matching command for option parsing
  const command = commands.find(
    (c) => c.name === result.command || c.aliases?.includes(result.command)
  );

  // Parse remaining arguments
  let i = 1;
  while (i < args.length) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      // Long option
      const [key, value] = parseOption(arg.slice(2), args, i);
      result.options[key] = value;
      i += value === true ? 1 : 2;
    } else if (arg.startsWith('-') && arg.length === 2) {
      // Short option
      const alias = arg[1];
      const optionDef = findOptionByAlias(alias, command?.options);
      const key = optionDef?.name ?? alias;
      const [, value] = parseOption(key, args, i, optionDef?.type);
      result.options[key] = value;
      i += value === true ? 1 : 2;
    } else {
      // Positional argument
      result.positional.push(arg);
      i++;
    }
  }

  return result;
}

/**
 * Parse a single option
 */
function parseOption(
  key: string,
  args: string[],
  index: number,
  type?: 'string' | 'number' | 'boolean'
): [string, unknown] {
  // Handle --key=value format
  if (key.includes('=')) {
    const [k, v] = key.split('=');
    return [k, parseValue(v, type)];
  }

  // Check if next arg is a value
  const nextArg = args[index + 1];
  if (nextArg && !nextArg.startsWith('-')) {
    return [key, parseValue(nextArg, type)];
  }

  // Boolean flag
  return [key, true];
}

/**
 * Parse a value with type coercion
 */
function parseValue(value: string, type?: 'string' | 'number' | 'boolean'): unknown {
  if (type === 'number') {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }

  if (type === 'boolean') {
    return value === 'true' || value === '1';
  }

  // Try to infer type
  if (value === 'true') return true;
  if (value === 'false') return false;

  const num = Number(value);
  if (!isNaN(num) && value.match(/^-?\d+(\.\d+)?$/)) {
    return num;
  }

  return value;
}

/**
 * Find an option definition by its alias
 */
function findOptionByAlias(
  alias: string,
  options?: CommandOption[]
): CommandOption | undefined {
  return options?.find((o) => o.alias === alias);
}

/**
 * Format duration string to seconds
 * e.g., "10s" -> 10, "2m" -> 120
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h)?$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2] || 's';

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    default:
      return value;
  }
}

/**
 * Parse frame count string
 * e.g., "120f" -> 120, "120" -> 120
 */
export function parseFrames(frames: string): number {
  const match = frames.match(/^(\d+)f?$/);
  if (!match) {
    throw new Error(`Invalid frame count format: ${frames}`);
  }
  return parseInt(match[1], 10);
}
