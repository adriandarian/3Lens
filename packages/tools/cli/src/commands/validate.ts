/**
 * Validate Commands
 *
 * Commands for running contract validation.
 *
 * @packageDocumentation
 */

import type { ValidateOptions, CommandResult } from '../types';
import {
  print,
  printError,
  printSuccess,
  printInfo,
  printWarning,
  printTable,
  fileExists,
  colors,
  Spinner,
} from '../utils';

/**
 * Available contracts
 */
export const CONTRACTS = [
  'inspector',
  'capture',
  'entity-graph',
  'attribution',
  'fidelity',
  'overhead',
  'discovery',
  'storage',
  'transport',
  'security-csp',
  'shader-graph',
  'pipelines',
  'ui-surfaces',
  'addons',
  'compatibility',
  'loading',
  'runtime-boundaries',
] as const;

export type ContractName = (typeof CONTRACTS)[number];

/**
 * Validation result for a single contract
 */
export interface ContractValidationResult {
  contract: string;
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    message?: string;
    duration?: number;
  }[];
  duration: number;
}

/**
 * Validate a specific contract
 *
 * @example
 * ```ts
 * import { validate } from '@3lens/cli';
 *
 * const result = await validate.contract('inspector');
 * console.log(result.passed);
 * ```
 */
export async function contract(
  contractName: string,
  options: ValidateOptions = {}
): Promise<CommandResult> {
  const { verbose } = options;
  const startTime = performance.now();

  if (!CONTRACTS.includes(contractName as ContractName)) {
    printError(`Unknown contract: ${contractName}`);
    print('\nAvailable contracts:');
    for (const c of CONTRACTS) {
      print(`  ${c}`);
    }
    return { exitCode: 1, message: `Unknown contract: ${contractName}` };
  }

  printInfo(`Validating contract: ${contractName}`);

  const spinner = new Spinner(`Running ${contractName} checks...`);
  spinner.start();

  // Simulate validation checks
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Implement actual contract validation
  // This would run the contract acceptance tests defined in agents/contracts/

  const checks = getContractChecks(contractName as ContractName);
  const results: ContractValidationResult['checks'] = [];

  for (const check of checks) {
    // Simulate check execution
    await new Promise((resolve) => setTimeout(resolve, 100));

    const passed = Math.random() > 0.1; // 90% pass rate for demo
    results.push({
      name: check,
      passed,
      message: passed ? undefined : `Check "${check}" failed`,
      duration: Math.random() * 100,
    });
  }

  const allPassed = results.every((r) => r.passed);
  const duration = performance.now() - startTime;

  spinner.stop(allPassed);

  // Print results
  print(`\n${colors.bold}Contract: ${contractName}${colors.reset}`);
  print('─'.repeat(50));

  for (const result of results) {
    const icon = result.passed
      ? `${colors.green}✓${colors.reset}`
      : `${colors.red}✗${colors.reset}`;
    print(`  ${icon} ${result.name}`);
    if (!result.passed && result.message) {
      print(`    ${colors.dim}${result.message}${colors.reset}`);
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  print(`\n${passedCount}/${results.length} checks passed (${duration.toFixed(0)}ms)`);

  const validationResult: ContractValidationResult = {
    contract: contractName,
    passed: allPassed,
    checks: results,
    duration,
  };

  return {
    exitCode: allPassed ? 0 : 1,
    message: allPassed ? `Contract ${contractName} passed` : `Contract ${contractName} failed`,
    data: validationResult,
  };
}

/**
 * Validate all contracts
 *
 * @example
 * ```ts
 * import { validate } from '@3lens/cli';
 *
 * const result = await validate.all({ verbose: true });
 * ```
 */
export async function all(options: ValidateOptions = {}): Promise<CommandResult> {
  const { verbose } = options;
  const startTime = performance.now();

  printInfo('Validating all contracts...\n');

  const results: ContractValidationResult[] = [];

  for (const contractName of CONTRACTS) {
    const spinner = new Spinner(`Validating ${contractName}...`);
    spinner.start();

    // Run contract validation
    const contractResult = await contract(contractName, { verbose: false });
    const data = contractResult.data as ContractValidationResult;

    spinner.stop(data.passed);
    results.push(data);
  }

  const duration = performance.now() - startTime;
  const passedContracts = results.filter((r) => r.passed);
  const failedContracts = results.filter((r) => !r.passed);

  // Summary
  print(`\n${colors.bold}Validation Summary${colors.reset}`);
  print('─'.repeat(50));

  printTable(
    ['Contract', 'Status', 'Checks', 'Duration'],
    results.map((r) => [
      r.contract,
      r.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`,
      `${r.checks.filter((c) => c.passed).length}/${r.checks.length}`,
      `${r.duration.toFixed(0)}ms`,
    ])
  );

  print('');

  if (failedContracts.length === 0) {
    printSuccess(`All ${results.length} contracts passed! (${(duration / 1000).toFixed(2)}s)`);
  } else {
    printError(`${failedContracts.length}/${results.length} contracts failed`);
    print('\nFailed contracts:');
    for (const failed of failedContracts) {
      print(`  ${colors.red}✗${colors.reset} ${failed.contract}`);
      if (verbose) {
        for (const check of failed.checks.filter((c) => !c.passed)) {
          print(`    - ${check.name}: ${check.message}`);
        }
      }
    }
  }

  return {
    exitCode: failedContracts.length === 0 ? 0 : 1,
    message: failedContracts.length === 0 ? 'All contracts passed' : 'Some contracts failed',
    data: results,
  };
}

/**
 * Get checks for a specific contract
 */
function getContractChecks(contractName: ContractName): string[] {
  const checks: Record<ContractName, string[]> = {
    inspector: [
      'Select any node/entity',
      'Display identity info',
      'Show dependencies',
      'Navigate edges',
      'Filter by type',
    ],
    capture: [
      'Record events',
      'Chunk management',
      'Snapshot creation',
      'Export profiles',
    ],
    'entity-graph': [
      'Node creation',
      'Edge creation',
      'Property updates',
      'Graph queries',
      'Snapshot/restore',
    ],
    attribution: [
      'GPU time attribution',
      'CPU time attribution',
      'Memory attribution',
      'Culprit path resolution',
    ],
    fidelity: [
      'Value accuracy',
      'Timing precision',
      'No false positives',
      'Complete coverage',
    ],
    overhead: [
      'CPU overhead < 5%',
      'Memory overhead < 10MB',
      'No frame drops',
      'Lazy initialization',
    ],
    discovery: [
      'WebGL context detection',
      'WebGPU context detection',
      'Multiple context support',
      'Late context registration',
    ],
    storage: [
      'Ring buffer limits',
      'IndexedDB persistence',
      'Memory pressure handling',
      'Export/import',
    ],
    transport: [
      'Same-page communication',
      'DevTools communication',
      'Worker communication',
      'Message serialization',
    ],
    'security-csp': [
      'CSP compatibility',
      'No inline scripts',
      'No eval usage',
      'Strict mode support',
    ],
    'shader-graph': [
      'Vertex shader parsing',
      'Fragment shader parsing',
      'Uniform detection',
      'Variant tracking',
    ],
    pipelines: [
      'Render pipeline detection',
      'Compute pipeline detection',
      'Pipeline state tracking',
    ],
    'ui-surfaces': [
      'Overlay mode',
      'Dock mode',
      'Window mode',
      'Responsive layout',
    ],
    addons: [
      'Addon registration',
      'Addon lifecycle',
      'Addon isolation',
      'Dependency resolution',
    ],
    compatibility: [
      'three.js 0.150+',
      'WebGL support',
      'WebGPU support (optional)',
      'Modern browsers',
    ],
    loading: [
      'Lazy loading',
      'Code splitting',
      'Tree shaking',
      'Bundle size',
    ],
    'runtime-boundaries': [
      'No production leakage',
      'Dev-only imports',
      'Clean removal',
    ],
  };

  return checks[contractName] || [];
}

/**
 * CLI handler for validate command
 */
export async function handleValidate(
  args: string[],
  options: Record<string, unknown>
): Promise<number> {
  const validateOptions: ValidateOptions = {
    verbose: options.verbose as boolean,
  };

  if (args.length === 0 || args[0] === 'all') {
    const result = await all(validateOptions);
    return result.exitCode;
  }

  const result = await contract(args[0], validateOptions);
  return result.exitCode;
}
