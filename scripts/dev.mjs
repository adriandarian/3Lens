#!/usr/bin/env node
/**
 * Development script that ensures packages build in the correct dependency order
 * before starting watch mode.
 *
 * Build order:
 * 1. @3lens/core (no internal dependencies)
 * 2. @3lens/ui, @3lens/angular-bridge, @3lens/react-bridge, @3lens/vue-bridge (depend on core)
 * 3. @3lens/overlay (depends on core and ui)
 * 4. Start watch mode for all packages in parallel
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Track the watch process for graceful shutdown
let watchProcess = null;

/**
 * Run a command and return a promise
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\x1b[36m➜ Running: ${command} ${args.join(' ')}\x1b[0m`);

    const proc = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

/**
 * Run a command in the background (for watch mode)
 */
function runBackground(command, args) {
  console.log(`\x1b[36m➜ Starting: ${command} ${args.join(' ')}\x1b[0m`);

  const proc = spawn(command, args, {
    cwd: rootDir,
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: true,
    detached: true,
  });

  proc.on('error', (err) => {
    console.error(`\x1b[31mError: ${err.message}\x1b[0m`);
  });

  return proc;
}

// Flag to prevent multiple shutdown calls
let isShuttingDown = false;

/**
 * Graceful shutdown handler
 */
function shutdown() {
  // Prevent multiple calls
  if (isShuttingDown) return;
  isShuttingDown = true;

  // Print shutdown message and exit immediately to prevent pnpm error output
  console.log(`\n\x1b[32m✓ Development server stopped\x1b[0m\n`);
  
  if (watchProcess) {
    // Kill the process group to ensure all child processes are terminated
    try {
      process.kill(-watchProcess.pid, 'SIGKILL');
    } catch {
      // Process might already be dead
    }
  }
  
  // Exit immediately
  process.exit(0);
}

// Register signal handlers for graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function main() {
  console.log('\x1b[35m╔════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[35m║          3Lens Development Server                      ║\x1b[0m');
  console.log('\x1b[35m╚════════════════════════════════════════════════════════╝\x1b[0m');
  console.log('');

  try {
    // Phase 1: Build core first (foundation package)
    console.log('\x1b[33m📦 Phase 1: Building @3lens/core...\x1b[0m');
    await runCommand('pnpm', ['--filter', '@3lens/core', 'build']);
    console.log('\x1b[32m✓ @3lens/core built successfully\x1b[0m\n');

    // Phase 2: Build packages that depend only on core (in parallel)
    console.log('\x1b[33m📦 Phase 2: Building UI and framework bridges...\x1b[0m');
    await runCommand('pnpm', [
      '--filter', '@3lens/ui',
      '--filter', '@3lens/angular-bridge',
      '--filter', '@3lens/react-bridge',
      '--filter', '@3lens/vue-bridge',
      '--parallel',
      'build'
    ]);
    console.log('\x1b[32m✓ UI and framework bridges built successfully\x1b[0m\n');

    // Phase 3: Build overlay (depends on core and ui)
    console.log('\x1b[33m📦 Phase 3: Building @3lens/overlay...\x1b[0m');
    await runCommand('pnpm', ['--filter', '@3lens/overlay', 'build']);
    console.log('\x1b[32m✓ @3lens/overlay built successfully\x1b[0m\n');

    // Phase 4: Start watch mode for all packages in parallel
    console.log('\x1b[33m👀 Phase 4: Starting watch mode...\x1b[0m');
    console.log('\x1b[90m(All packages will now rebuild on file changes)\x1b[0m');
    console.log('\x1b[90m(Press Ctrl+C to stop)\x1b[0m\n');

    // Start all packages in watch mode - use explicit package names to avoid glob issues
    watchProcess = runBackground('pnpm', [
      '--filter', '@3lens/core',
      '--filter', '@3lens/ui',
      '--filter', '@3lens/overlay',
      '--filter', '@3lens/angular-bridge',
      '--filter', '@3lens/react-bridge',
      '--filter', '@3lens/vue-bridge',
      '--filter', '@3lens/example-vanilla-threejs',
      '--parallel',
      'dev'
    ]);

    // Wait for the watch process to exit (or be killed)
    watchProcess.on('close', () => {
      // If we get here without the shutdown handler, just exit cleanly
      process.exit(0);
    });

  } catch (error) {
    console.error(`\x1b[31m✗ Build failed: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

main();
