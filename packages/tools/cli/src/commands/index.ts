/**
 * CLI Commands
 *
 * All available CLI commands.
 *
 * @packageDocumentation
 */

// Trace commands
export * as trace from './trace';
export {
  record as traceRecord,
  open as traceOpen,
  exportTrace,
  handleRecord,
  handleOpen,
  handleExport,
} from './trace';

// Diff commands
export * as diff from './diff';
export {
  traces as diffTraces,
  frames as diffFrames,
  handleDiff,
  type TraceDiff,
} from './diff';

// Query commands
export * as query from './query';
export {
  topHotspots,
  leaks,
  shaderVariants,
  resourceUsage,
  handleQuery,
  type QueryResult,
  type Hotspot,
  type Leak,
} from './query';

// Validate commands
export * as validate from './validate';
export {
  contract,
  all as validateAll,
  handleValidate,
  CONTRACTS,
  type ContractName,
  type ContractValidationResult,
} from './validate';

// Doctor commands
export * as doctor from './doctor';
export {
  run as doctorRun,
  discovery as doctorDiscovery,
  host as doctorHost,
  storage as doctorStorage,
  csp as doctorCsp,
  handleDoctor,
  type DoctorReport,
} from './doctor';

// Scaffold commands
export * as scaffold from './scaffold';
export {
  panel as scaffoldPanel,
  probe as scaffoldProbe,
  host as scaffoldHost,
  addon as scaffoldAddon,
  handleScaffold,
  type ScaffoldType,
} from './scaffold';
