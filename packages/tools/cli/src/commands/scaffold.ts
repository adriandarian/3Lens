/**
 * Scaffold Commands
 *
 * Commands for generating boilerplate code.
 *
 * @packageDocumentation
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import type { ScaffoldOptions, CommandResult } from '../types';
import {
  print,
  printError,
  printSuccess,
  printInfo,
  printWarning,
  colors,
} from '../utils';

/**
 * Scaffold type
 */
export type ScaffoldType = 'panel' | 'probe' | 'host' | 'addon';

/**
 * Scaffold a panel
 *
 * @example
 * ```ts
 * import { scaffold } from '@3lens/cli';
 *
 * await scaffold.panel('perf-timeline');
 * ```
 */
export async function panel(
  name: string,
  options: ScaffoldOptions = {}
): Promise<CommandResult> {
  const { addon } = options;

  const baseDir = addon
    ? resolve(process.cwd(), 'packages', addon, 'src', 'panels')
    : resolve(process.cwd(), 'src', 'panels');

  const panelDir = resolve(baseDir, name);

  if (existsSync(panelDir)) {
    printError(`Panel directory already exists: ${panelDir}`);
    return { exitCode: 1, message: 'Directory exists' };
  }

  printInfo(`Scaffolding panel: ${name}`);

  mkdirSync(panelDir, { recursive: true });

  // Create panel files
  const files = {
    'index.ts': generatePanelIndex(name),
    [`${name}.ts`]: generatePanelComponent(name),
    'types.ts': generatePanelTypes(name),
    'queries.ts': generatePanelQueries(name),
  };

  for (const [filename, content] of Object.entries(files)) {
    const filepath = join(panelDir, filename);
    writeFileSync(filepath, content, 'utf-8');
    print(`  ${colors.green}+${colors.reset} ${filepath}`);
  }

  printSuccess(`Panel "${name}" scaffolded successfully!`);
  print('\nNext steps:');
  print(`  1. Implement panel logic in ${name}/${name}.ts`);
  print(`  2. Register panel in your addon or UI configuration`);
  print(`  3. Run contract validation: 3lens validate ui-surfaces`);

  return { exitCode: 0, message: `Panel ${name} created` };
}

/**
 * Scaffold a probe
 *
 * @example
 * ```ts
 * import { scaffold } from '@3lens/cli';
 *
 * await scaffold.probe('texture-upload');
 * ```
 */
export async function probe(name: string): Promise<CommandResult> {
  const baseDir = resolve(process.cwd(), 'src', 'probes');
  const probeFile = resolve(baseDir, `${name}.ts`);

  if (existsSync(probeFile)) {
    printError(`Probe file already exists: ${probeFile}`);
    return { exitCode: 1, message: 'File exists' };
  }

  printInfo(`Scaffolding probe: ${name}`);

  mkdirSync(baseDir, { recursive: true });
  writeFileSync(probeFile, generateProbe(name), 'utf-8');
  print(`  ${colors.green}+${colors.reset} ${probeFile}`);

  printSuccess(`Probe "${name}" scaffolded successfully!`);
  print('\nNext steps:');
  print(`  1. Implement probe hooks in ${name}.ts`);
  print(`  2. Register probe in your host configuration`);
  print(`  3. Run contract validation: 3lens validate capture`);

  return { exitCode: 0, message: `Probe ${name} created` };
}

/**
 * Scaffold a host
 *
 * @example
 * ```ts
 * import { scaffold } from '@3lens/cli';
 *
 * await scaffold.host('my-framework');
 * ```
 */
export async function host(name: string): Promise<CommandResult> {
  const baseDir = resolve(process.cwd(), 'packages', `host-${name}`);

  if (existsSync(baseDir)) {
    printError(`Host package already exists: ${baseDir}`);
    return { exitCode: 1, message: 'Directory exists' };
  }

  printInfo(`Scaffolding host: ${name}`);

  mkdirSync(resolve(baseDir, 'src'), { recursive: true });

  const files = {
    'package.json': generateHostPackageJson(name),
    'tsconfig.json': generateTsConfig(),
    'vite.config.ts': generateViteConfig(name, 'host'),
    'src/index.ts': generateHostIndex(name),
  };

  for (const [filename, content] of Object.entries(files)) {
    const filepath = join(baseDir, filename);
    writeFileSync(filepath, content, 'utf-8');
    print(`  ${colors.green}+${colors.reset} ${filepath}`);
  }

  printSuccess(`Host "${name}" scaffolded successfully!`);
  print('\nNext steps:');
  print(`  1. Implement host logic in src/index.ts`);
  print(`  2. Install dependencies: pnpm install`);
  print(`  3. Build: pnpm build`);
  print(`  4. Run contract validation: 3lens validate discovery`);

  return { exitCode: 0, message: `Host ${name} created` };
}

/**
 * Scaffold an addon
 *
 * @example
 * ```ts
 * import { scaffold } from '@3lens/cli';
 *
 * await scaffold.addon('my-company-addon');
 * ```
 */
export async function addon(name: string): Promise<CommandResult> {
  const baseDir = resolve(process.cwd(), 'packages', `addon-${name}`);

  if (existsSync(baseDir)) {
    printError(`Addon package already exists: ${baseDir}`);
    return { exitCode: 1, message: 'Directory exists' };
  }

  printInfo(`Scaffolding addon: ${name}`);

  mkdirSync(resolve(baseDir, 'src'), { recursive: true });

  const files = {
    'package.json': generateAddonPackageJson(name),
    'tsconfig.json': generateTsConfig(),
    'vite.config.ts': generateViteConfig(name, 'addon'),
    'src/index.ts': generateAddonIndex(name),
    'README.md': generateAddonReadme(name),
  };

  for (const [filename, content] of Object.entries(files)) {
    const filepath = join(baseDir, filename);
    writeFileSync(filepath, content, 'utf-8');
    print(`  ${colors.green}+${colors.reset} ${filepath}`);
  }

  printSuccess(`Addon "${name}" scaffolded successfully!`);
  print('\nNext steps:');
  print(`  1. Implement addon logic in src/index.ts`);
  print(`  2. Add panels/probes as needed`);
  print(`  3. Install dependencies: pnpm install`);
  print(`  4. Build: pnpm build`);
  print(`  5. Run contract validation: 3lens validate addons`);

  return { exitCode: 0, message: `Addon ${name} created` };
}

// Template generators

function generatePanelIndex(name: string): string {
  const pascalName = toPascalCase(name);
  return `/**
 * ${pascalName} Panel
 */

export { ${pascalName}Panel } from './${name}';
export type { ${pascalName}PanelProps, ${pascalName}State } from './types';
`;
}

function generatePanelComponent(name: string): string {
  const pascalName = toPascalCase(name);
  return `/**
 * ${pascalName} Panel Component
 */

import type { ${pascalName}PanelProps, ${pascalName}State } from './types';
import { query${pascalName}Data } from './queries';

/**
 * ${pascalName} Panel
 */
export class ${pascalName}Panel {
  private state: ${pascalName}State = {
    loading: true,
    data: null,
    error: null,
  };

  constructor(private props: ${pascalName}PanelProps) {}

  /**
   * Initialize the panel
   */
  async init(): Promise<void> {
    try {
      const data = await query${pascalName}Data(this.props.lens);
      this.state = { loading: false, data, error: null };
    } catch (error) {
      this.state = { loading: false, data: null, error: error as Error };
    }
  }

  /**
   * Render the panel
   */
  render(): HTMLElement {
    const container = document.createElement('div');
    container.className = '${name}-panel';

    if (this.state.loading) {
      container.innerHTML = '<div class="loading">Loading...</div>';
    } else if (this.state.error) {
      container.innerHTML = \`<div class="error">\${this.state.error.message}</div>\`;
    } else {
      // TODO: Implement panel rendering
      container.innerHTML = '<div>Panel content goes here</div>';
    }

    return container;
  }

  /**
   * Dispose the panel
   */
  dispose(): void {
    // Cleanup
  }
}
`;
}

function generatePanelTypes(name: string): string {
  const pascalName = toPascalCase(name);
  return `/**
 * ${pascalName} Panel Types
 */

import type { Lens } from '@3lens/runtime';

/**
 * Panel props
 */
export interface ${pascalName}PanelProps {
  lens: Lens;
  container?: HTMLElement;
}

/**
 * Panel state
 */
export interface ${pascalName}State {
  loading: boolean;
  data: ${pascalName}Data | null;
  error: Error | null;
}

/**
 * Panel data
 */
export interface ${pascalName}Data {
  // TODO: Define panel data structure
  items: unknown[];
}
`;
}

function generatePanelQueries(name: string): string {
  const pascalName = toPascalCase(name);
  return `/**
 * ${pascalName} Panel Queries
 */

import type { Lens } from '@3lens/runtime';
import type { ${pascalName}Data } from './types';

/**
 * Query data for the ${pascalName} panel
 */
export async function query${pascalName}Data(lens: Lens): Promise<${pascalName}Data> {
  // TODO: Implement query logic
  return {
    items: [],
  };
}
`;
}

function generateProbe(name: string): string {
  const pascalName = toPascalCase(name);
  return `/**
 * ${pascalName} Probe
 *
 * Custom probe for capturing ${name} events.
 */

import type { Lens, Event } from '@3lens/runtime';

/**
 * ${pascalName} probe configuration
 */
export interface ${pascalName}ProbeConfig {
  enabled?: boolean;
  // Add configuration options
}

/**
 * Create the ${pascalName} probe
 */
export function create${pascalName}Probe(config: ${pascalName}ProbeConfig = {}) {
  const { enabled = true } = config;

  return {
    name: '${name}',
    enabled,

    /**
     * Called when the probe is attached to a lens
     */
    attach(lens: Lens): void {
      if (!enabled) return;

      // TODO: Set up hooks and event listeners
      console.debug('[${pascalName}Probe] Attached');
    },

    /**
     * Called when the probe is detached
     */
    detach(lens: Lens): void {
      // TODO: Clean up hooks and listeners
      console.debug('[${pascalName}Probe] Detached');
    },

    /**
     * Called on each frame
     */
    onFrame(lens: Lens, frame: number): void {
      // TODO: Emit frame-specific events
    },

    /**
     * Emit a custom event
     */
    emit(lens: Lens, event: Partial<Event>): void {
      // TODO: Emit events through the lens
    },
  };
}
`;
}

function generateHostPackageJson(name: string): string {
  return JSON.stringify({
    name: `@3lens/host-${name}`,
    version: '1.0.0',
    description: `3Lens host for ${name}`,
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
      },
    },
    files: ['dist', 'src'],
    scripts: {
      build: 'vite build',
      dev: 'vite build --watch',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      '@3lens/runtime': 'workspace:*',
    },
    devDependencies: {
      typescript: 'catalog:',
      vite: 'catalog:',
    },
    peerDependencies: {
      three: '>=0.150.0',
    },
    keywords: ['3lens', 'host', name],
    license: 'MIT',
  }, null, 2);
}

function generateAddonPackageJson(name: string): string {
  return JSON.stringify({
    name: `@3lens/addon-${name}`,
    version: '1.0.0',
    description: `3Lens addon: ${name}`,
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
      },
    },
    files: ['dist', 'src'],
    scripts: {
      build: 'vite build',
      dev: 'vite build --watch',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      '@3lens/runtime': 'workspace:*',
    },
    devDependencies: {
      typescript: 'catalog:',
      vite: 'catalog:',
    },
    keywords: ['3lens', 'addon', name],
    license: 'MIT',
  }, null, 2);
}

function generateTsConfig(): string {
  return JSON.stringify({
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src',
      declaration: true,
      declarationMap: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  }, null, 2);
}

function generateViteConfig(name: string, type: 'host' | 'addon'): string {
  return `import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@3lens/runtime', '@3lens/kernel', 'three'],
    },
    sourcemap: true,
    minify: false,
  },
});
`;
}

function generateHostIndex(name: string): string {
  const pascalName = toPascalCase(name);
  return `/**
 * @3lens/host-${name}
 *
 * Host integration for ${name}.
 */

import type { Host, HostConfig, Lens } from '@3lens/runtime';

/**
 * ${pascalName} host configuration
 */
export interface ${pascalName}HostConfig extends HostConfig {
  // Add ${name}-specific configuration
}

/**
 * Create a ${pascalName} host
 */
export function create${pascalName}Host(config: ${pascalName}HostConfig = {}): Host {
  return {
    name: '${name}',

    /**
     * Attach to a lens instance
     */
    attach(lens: Lens): void {
      // TODO: Implement host attachment logic
      console.debug('[${pascalName}Host] Attached to lens');
    },

    /**
     * Detach from lens
     */
    detach(lens: Lens): void {
      // TODO: Clean up
      console.debug('[${pascalName}Host] Detached from lens');
    },

    /**
     * Discover three.js contexts
     */
    discoverContexts(): void {
      // TODO: Implement context discovery
    },
  };
}

export type { Host, HostConfig, Lens } from '@3lens/runtime';
`;
}

function generateAddonIndex(name: string): string {
  const pascalName = toPascalCase(name);
  return `/**
 * @3lens/addon-${name}
 *
 * ${pascalName} addon for 3Lens.
 */

import type { Addon, AddonConfig, Lens } from '@3lens/runtime';

/**
 * ${pascalName} addon configuration
 */
export interface ${pascalName}AddonConfig extends AddonConfig {
  // Add addon-specific configuration
}

/**
 * Create the ${pascalName} addon
 */
export function create${pascalName}Addon(config: ${pascalName}AddonConfig = {}): Addon {
  return {
    name: '${name}',
    version: '1.0.0',

    /**
     * Called when addon is loaded
     */
    load(lens: Lens): void {
      console.debug('[${pascalName}Addon] Loaded');
    },

    /**
     * Called when addon is unloaded
     */
    unload(lens: Lens): void {
      console.debug('[${pascalName}Addon] Unloaded');
    },

    /**
     * Addon requirements
     */
    requires: {
      minKernelVersion: '1.0.0',
      capabilities: [],
    },
  };
}

export type { Addon, AddonConfig, Lens } from '@3lens/runtime';
`;
}

function generateAddonReadme(name: string): string {
  const pascalName = toPascalCase(name);
  return `# @3lens/addon-${name}

${pascalName} addon for 3Lens.

## Installation

\`\`\`bash
pnpm add @3lens/addon-${name}
\`\`\`

## Usage

\`\`\`typescript
import { createLens } from '@3lens/runtime';
import { create${pascalName}Addon } from '@3lens/addon-${name}';

const lens = createLens({
  addons: [
    create${pascalName}Addon({
      // configuration
    }),
  ],
});
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| | | | |

## License

MIT
`;
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * CLI handler for scaffold command
 */
export async function handleScaffold(
  args: string[],
  options: Record<string, unknown>
): Promise<number> {
  if (args.length < 2) {
    printError('Usage: 3lens scaffold <type> <name>');
    print('\nAvailable types:');
    print('  panel  - Create a new panel');
    print('  probe  - Create a new probe');
    print('  host   - Create a new host package');
    print('  addon  - Create a new addon package');
    return 1;
  }

  const [type, name] = args;
  const scaffoldOptions: ScaffoldOptions = {
    addon: options.addon as string,
  };

  let result: CommandResult;

  switch (type) {
    case 'panel':
      result = await panel(name, scaffoldOptions);
      break;
    case 'probe':
      result = await probe(name);
      break;
    case 'host':
      result = await host(name);
      break;
    case 'addon':
      result = await addon(name);
      break;
    default:
      printError(`Unknown scaffold type: ${type}`);
      return 1;
  }

  return result.exitCode;
}
