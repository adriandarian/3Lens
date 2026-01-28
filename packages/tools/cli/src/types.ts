/**
 * CLI Types
 *
 * Type definitions for the 3Lens CLI.
 *
 * @packageDocumentation
 */

/**
 * CLI command handler
 */
export type CommandHandler = (args: string[], options: Record<string, unknown>) => Promise<number>;

/**
 * CLI command definition
 */
export interface Command {
  /** Command name */
  name: string;
  /** Command description */
  description: string;
  /** Usage examples */
  usage?: string[];
  /** Command aliases */
  aliases?: string[];
  /** Available options */
  options?: CommandOption[];
  /** Subcommands */
  subcommands?: Command[];
  /** Handler function */
  handler: CommandHandler;
}

/**
 * Command option definition
 */
export interface CommandOption {
  /** Option name (without dashes) */
  name: string;
  /** Short alias (single character) */
  alias?: string;
  /** Option description */
  description: string;
  /** Option type */
  type: 'string' | 'number' | 'boolean';
  /** Default value */
  default?: unknown;
  /** Required flag */
  required?: boolean;
}

/**
 * Parsed CLI arguments
 */
export interface ParsedArgs {
  /** Command name */
  command: string;
  /** Subcommand name (if any) */
  subcommand?: string;
  /** Positional arguments */
  positional: string[];
  /** Named options */
  options: Record<string, unknown>;
}

/**
 * CLI configuration
 */
export interface CLIConfig {
  /** Program name */
  name: string;
  /** Program version */
  version: string;
  /** Program description */
  description: string;
  /** Available commands */
  commands: Command[];
}

/**
 * Trace record options
 */
export interface TraceRecordOptions {
  /** Duration in seconds */
  duration?: number;
  /** Number of frames to record */
  frames?: number;
  /** Record until idle */
  untilIdle?: boolean;
  /** Capture mode */
  mode?: 'MINIMAL' | 'STANDARD' | 'DEEP';
  /** Specific context IDs */
  contexts?: string[];
  /** Output file path */
  out: string;
}

/**
 * Trace open options
 */
export interface TraceOpenOptions {
  /** Run in headless mode */
  headless?: boolean;
}

/**
 * Diff options
 */
export interface DiffOptions {
  /** Output report path */
  report?: string;
  /** Fail on regression */
  failOnRegression?: boolean;
}

/**
 * Query options
 */
export interface QueryOptions {
  /** Time window (frames) */
  window?: number;
  /** Metric to query */
  metric?: 'gpu_time' | 'cpu_time' | 'memory_delta' | 'draw_count' | 'triangle_count';
  /** Result limit */
  limit?: number;
  /** Context ID */
  context?: string;
  /** Verbose output */
  verbose?: boolean;
  /** Threshold for leak detection */
  threshold?: number;
  /** Resource type */
  type?: string;
  /** Sort field */
  sort?: string;
}

/**
 * Validate options
 */
export interface ValidateOptions {
  /** Verbose output */
  verbose?: boolean;
}

/**
 * Doctor options
 */
export interface DoctorOptions {
  /** Output as JSON */
  json?: boolean;
  /** Export to file */
  export?: string;
}

/**
 * Scaffold options
 */
export interface ScaffoldOptions {
  /** Target addon (for panel scaffolding) */
  addon?: string;
}

/**
 * Result from CLI command execution
 */
export interface CommandResult {
  /** Exit code (0 = success) */
  exitCode: number;
  /** Output message */
  message?: string;
  /** Result data (for programmatic use) */
  data?: unknown;
}
