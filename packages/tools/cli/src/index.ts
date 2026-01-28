/**
 * @3lens/cli
 *
 * CLI and programmatic API for 3Lens - trace recording, analysis, and validation.
 *
 * @packageDocumentation
 */

// Types
export * from './types';

// Commands (programmatic API)
export * from './commands';

// Parser utilities (for custom CLI integrations)
export { parseArgs, parseDuration, parseFrames } from './parser';

// Utility exports
export {
  print,
  printError,
  printSuccess,
  printWarning,
  printInfo,
  printTable,
  formatBytes,
  formatDuration,
  readJsonFile,
  writeJsonFile,
  resolvePath,
  fileExists,
  Spinner,
  confirm,
  colors,
} from './utils';

// Version
export const CLI_VERSION = '1.0.0';
