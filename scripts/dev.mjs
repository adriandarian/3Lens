#!/usr/bin/env node
/**
 * Development script that ensures packages build in the correct dependency order
 * before starting watch mode.
 *
 * Build order:
 * 1. @3lens/kernel (no internal dependencies)
 * 2. @3lens/runtime + @3lens/ui-core (depend on kernel)
 * 3. Remaining packages (addons, hosts, ui-web, devtools, etc.)
 * 4. Start package watchers (silent) + example dev server (controlled)
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const isWindows = process.platform === 'win32';

// All child processes we need to kill on exit
const children = [];

/**
 * Run a command synchronously (build phases), inheriting stdio.
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
      if (code === 0) resolve();
      else reject(new Error(`Command failed with exit code ${code}`));
    });
    proc.on('error', reject);
  });
}

/**
 * Spawn a background process, capturing its output so we can filter it.
 * Only errors pass through to stdout. Returns the child process.
 */
function spawnSilent(command, args, cwd) {
  const proc = spawn(command, args, {
    cwd: cwd ?? rootDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  children.push(proc);

  function onData(data) {
    const text = data.toString();
    // Only surface lines that look like errors
    for (const line of text.split('\n')) {
      if (/error|Error|ERR_|failed|Failed|FAILED/.test(line) && line.trim()) {
        process.stderr.write('\x1b[31m' + line + '\x1b[0m\n');
      }
    }
  }

  proc.stdout.on('data', onData);
  proc.stderr.on('data', onData);
  proc.on('error', (err) => process.stderr.write(`\x1b[31mProcess error: ${err.message}\x1b[0m\n`));
  return proc;
}

function printBanner(url) {
  console.log('\n\x1b[35m┌─────────────────────────────────────────────┐\x1b[0m');
  console.log(`\x1b[35m│\x1b[0m  \x1b[1m▶  App running at \x1b[32m${url}\x1b[0m`);
  console.log('\x1b[35m│\x1b[0m  \x1b[90mCtrl+C to stop  •  save files to trigger rebuild\x1b[0m');
  console.log('\x1b[35m└─────────────────────────────────────────────┘\x1b[0m\n');
}

/**
 * Spawn the Vite dev server for the example.
 * On Windows, pnpm's shell wrapper can swallow Vite's stdout, so we use a
 * two-track approach: listen for the "Local:" line, but also fall back to
 * printing the banner after a timeout if the line never arrives.
 */
function spawnExampleServer(exampleDir) {
  const DEV_URL = 'http://localhost:3000/';
  const proc = spawn('pnpm', ['vite', '--port', '3000', '--strictPort'], {
    cwd: exampleDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  children.push(proc);

  let bannerPrinted = false;

  // Fallback: if Vite's "Local:" line never comes through the pipe (Windows
  // pnpm shell wrapping issue), print the banner after 5s anyway.
  const fallbackTimer = setTimeout(() => {
    if (!bannerPrinted) {
      bannerPrinted = true;
      printBanner(DEV_URL);
    }
  }, 5000);

  function onData(data) {
    const text = data.toString();
    for (const line of text.split('\n')) {
      const urlMatch = line.match(/Local:\s+(http:\/\/localhost:\d+\/?)/);
      if (urlMatch && !bannerPrinted) {
        bannerPrinted = true;
        clearTimeout(fallbackTimer);
        printBanner(urlMatch[1]);
        continue;
      }
      if (/error|Error|ERR_|failed|Failed|FAILED/.test(line) && line.trim()) {
        process.stderr.write('\x1b[31m' + line + '\x1b[0m\n');
      }
    }
  }

  proc.stdout.on('data', onData);
  proc.stderr.on('data', onData);
  proc.on('error', (err) => process.stderr.write(`\x1b[31mVite error: ${err.message}\x1b[0m\n`));
  proc.on('close', () => {
    if (!isShuttingDown) shutdown();
  });

  return proc;
}

// Graceful shutdown
let isShuttingDown = false;

function killProc(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (isWindows) {
      execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore', timeout: 1000 });
    } else {
      process.kill(-proc.pid, 'SIGKILL');
    }
  } catch {
    // already dead
  }
}

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\x1b[32m✓ Development server stopped\x1b[0m\n');
  for (const proc of children) killProc(proc);
  process.exitCode = 0;
  setImmediate(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function makeFilters(packages) {
  return packages.flatMap((p) => ['--filter', p]);
}

// Packages that run in watch mode (library watchers — silent)
const WATCH_PACKAGES = [
  '@3lens/kernel',
  '@3lens/runtime',
  '@3lens/ui-core',
  '@3lens/host-manual',
  '@3lens/addon-inspector',
  '@3lens/addon-perf',
  '@3lens/addon-memory',
  '@3lens/addon-diff',
  '@3lens/addon-shader',
  '@3lens/ui-web',
  '@3lens/devtools',
];

async function main() {
  console.log('\x1b[35m╔════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[35m║          3Lens Development Server                      ║\x1b[0m');
  console.log('\x1b[35m╚════════════════════════════════════════════════════════╝\x1b[0m\n');

  try {
    // Phase 1: Build kernel
    console.log('\x1b[33m📦 Phase 1: Building @3lens/kernel...\x1b[0m');
    await runCommand('pnpm', ['--filter', '@3lens/kernel', 'build']);
    console.log('\x1b[32m✓ @3lens/kernel built successfully\x1b[0m\n');

    // Phase 2: Build runtime + ui-core
    console.log('\x1b[33m📦 Phase 2: Building @3lens/runtime + @3lens/ui-core...\x1b[0m');
    await runCommand('pnpm', [
      '--filter', '@3lens/runtime',
      '--filter', '@3lens/ui-core',
      '--parallel', 'build',
    ]);
    console.log('\x1b[32m✓ @3lens/runtime + @3lens/ui-core built successfully\x1b[0m\n');

    // Phase 3: Build everything else
    console.log('\x1b[33m📦 Phase 3: Building remaining packages...\x1b[0m');
    await runCommand('pnpm', [
      ...makeFilters([
        '@3lens/host-manual', '@3lens/host-r3f', '@3lens/host-tres', '@3lens/host-worker',
        '@3lens/addon-inspector', '@3lens/addon-perf', '@3lens/addon-memory',
        '@3lens/addon-diff', '@3lens/addon-shader',
        '@3lens/ui-web', '@3lens/devtools',
        '@3lens/mount-react', '@3lens/mount-vue', '@3lens/mount-angular', '@3lens/mount-svelte',
        '@3lens/cli', '@3lens/vite-plugin',
      ]),
      '--parallel', 'build',
    ]);
    console.log('\x1b[32m✓ All packages built successfully\x1b[0m\n');

    // Phase 4: Start watchers + dev server
    console.log('\x1b[33m👀 Phase 4: Starting watchers...\x1b[0m');

    // Kill anything already on port 3000 so Vite always gets it
    try {
      if (isWindows) {
        execSync(
          'for /f "tokens=5" %a in (\'netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"\') do taskkill /F /PID %a',
          { stdio: 'ignore', shell: true }
        );
      } else {
        execSync('lsof -ti:3000 | xargs kill -9', { stdio: 'ignore' });
      }
    } catch {
      // Nothing was on the port — that's fine
    }

    // Package library watchers — completely silent, errors only
    spawnSilent('pnpm', [...makeFilters(WATCH_PACKAGES), '--parallel', '--silent', 'dev']);

    // Example dev server — we own its output
    const exampleDir = resolve(rootDir, 'examples/getting-started/vanilla-threejs');
    console.log('\x1b[90m(Waiting for Vite...)\x1b[0m');
    spawnExampleServer(exampleDir);

  } catch (error) {
    console.error(`\x1b[31m✗ Build failed: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

main();
