#!/usr/bin/env node
/**
 * Development script that ensures packages build in the correct dependency order
 * before starting watch mode.
 *
 * Build order:
 * 1. @3lens/core (no internal dependencies)
 * 2. @3lens/ui (depends on core)
 * 3. @3lens/overlay (depends on core and ui)
 * 4. Start watch mode for core, ui, overlay, and the vanilla-threejs example
 *
 * Note: Framework bridges (angular, react, vue) are skipped as they're not needed
 * for the vanilla Three.js dev example.
 */

import { spawn, execSync } from 'child_process';
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

  // Print shutdown message
  console.log(`\n\x1b[32m✓ Development server stopped\x1b[0m\n`);
  
  const isWindows = process.platform === 'win32';
  
  if (watchProcess && watchProcess.pid) {
    try {
      if (isWindows) {
        // On Windows, kill the process and its children aggressively
        // First try to kill the process directly
        try {
          watchProcess.kill('SIGTERM');
        } catch {
          // Ignore
        }
        
        // Then use taskkill to forcefully kill the process tree
        // /F = force kill, /T = kill process tree, /PID = process ID
        // Redirect all output to nul to suppress prompts
        try {
          execSync(`taskkill /F /T /PID ${watchProcess.pid}`, { 
            stdio: 'ignore',
            timeout: 1000
          });
        } catch {
          // Process might already be dead, ignore
        }
      } else {
        // On Unix-like systems, use SIGKILL for forceful termination
        // Negative PID kills the process group
        process.kill(-watchProcess.pid, 'SIGKILL');
      }
    } catch {
      // Ignore all errors - we're shutting down anyway
    }
  }
  
  // Exit immediately with exit code 0
  // Set exitCode first, then exit to ensure clean shutdown
  process.exitCode = 0;
  // Use setImmediate to ensure kill commands execute, then exit
  setImmediate(() => {
    process.exit(0);
  });
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

    // Phase 2: Build UI (depends on core)
    console.log('\x1b[33m📦 Phase 2: Building @3lens/ui...\x1b[0m');
    await runCommand('pnpm', ['--filter', '@3lens/ui', 'build']);
    console.log('\x1b[32m✓ @3lens/ui built successfully\x1b[0m\n');

    // Phase 3: Build overlay (depends on core and ui)
    console.log('\x1b[33m📦 Phase 3: Building @3lens/overlay...\x1b[0m');
    await runCommand('pnpm', ['--filter', '@3lens/overlay', 'build']);
    console.log('\x1b[32m✓ @3lens/overlay built successfully\x1b[0m\n');

    // Phase 4: Start watch mode for all packages in parallel
    console.log('\x1b[33m👀 Phase 4: Starting watch mode...\x1b[0m');
    console.log('\x1b[90m(All packages will now rebuild on file changes)\x1b[0m');
    console.log('\x1b[90m(Press Ctrl+C to stop)\x1b[0m\n');

    // Start watch mode for core packages and the dev example
    // Framework bridges are skipped as they're not needed for vanilla Three.js dev
    watchProcess = runBackground('pnpm', [
      '--filter', '@3lens/core',
      '--filter', '@3lens/ui',
      '--filter', '@3lens/overlay',
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
