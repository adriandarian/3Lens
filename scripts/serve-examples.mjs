#!/usr/bin/env node
/**
 * Serve examples during development
 * 
 * This script starts development servers for specific examples
 * that can be embedded in the VitePress docs.
 * 
 * Usage:
 *   pnpm dev:examples <example-name> [example-name2 ...]
 *   node scripts/serve-examples.mjs <example-name>
 *   node scripts/serve-examples.mjs --list
 */

import { spawn, execSync } from 'child_process';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'net';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const examplesDir = join(rootDir, 'examples');

// Port allocation starts at 3000
let nextPort = 3000;
const portMap = new Map();

/**
 * Check if a port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

/**
 * Find the next available port starting from a given port
 */
async function findAvailablePort(startPort) {
  let port = startPort;
  while (port < 65535) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    port++;
  }
  throw new Error('No available ports found');
}

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Recursively find example directories with metadata
 */
function findExamples(dir, examples = []) {
  try {
    const entries = readdirSync(dir);
    
    const hasPackageJson = entries.includes('package.json');
    const hasViteConfig = entries.some(e => e.startsWith('vite.config'));
    
    if (hasPackageJson && hasViteConfig) {
      const relativePath = relative(examplesDir, dir).replace(/\\/g, '/');
      let name = '';
      let description = '';
      
      try {
        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
        name = pkg.name || '';
        description = pkg.description || '';
      } catch {
        // Skip invalid package.json
      }
      
      examples.push({
        path: dir,
        relativePath,
        name,
        description,
      });
      return examples;
    }
    
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) {
        continue;
      }
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        findExamples(fullPath, examples);
      }
    }
  } catch {
    // Directory doesn't exist or isn't readable
  }
  
  return examples;
}

/**
 * Find example by name or path
 */
function findExampleByQuery(examples, query) {
  // Try as exact name match
  const exactMatch = examples.find(
    (e) =>
      e.name === query ||
      e.name === `@3lens/example-${query}` ||
      e.relativePath === query ||
      e.relativePath.endsWith(query) ||
      e.relativePath.includes(query)
  );
  if (exactMatch) return exactMatch;

  // Try as partial match
  const partialMatches = examples.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.relativePath.toLowerCase().includes(query.toLowerCase())
  );

  if (partialMatches.length === 1) return partialMatches[0];
  if (partialMatches.length > 1) {
    log(`Multiple matches found for "${query}":`, colors.yellow);
    partialMatches.forEach((m, i) => {
      log(`  ${i + 1}. ${m.name || m.relativePath}`);
    });
    return null;
  }

  return null;
}

/**
 * List all available examples
 */
function listExamples(examples) {
  log('\n📦 Available 3Lens Examples\n', colors.bright);

  // Group by category (first directory)
  const grouped = {};
  for (const example of examples) {
    const category = example.relativePath.split('/')[0];
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(example);
  }

  for (const [category, categoryExamples] of Object.entries(grouped)) {
    log(`${category}:`, colors.cyan);
    for (const example of categoryExamples) {
      const displayName = example.name.replace('@3lens/example-', '') || example.relativePath;
      log(`  • ${displayName}`, colors.green);
      if (example.description) {
        log(`    ${example.description}`, colors.reset);
      }
    }
    log('');
  }
}

/**
 * Start a development server for an example
 */
async function startExampleServer(example) {
  const exampleId = example.relativePath;
  const port = await findAvailablePort(nextPort);
  nextPort = port + 1;
  
  portMap.set(exampleId, port);
  
  log(`\n${colors.cyan}[${exampleId}]${colors.reset} Starting on port ${port}...`);
  
  const child = spawn('pnpm', ['vite', '--port', port.toString(), '--strictPort', '--no-open'], {
    cwd: example.path,
    stdio: 'pipe',
    shell: true,
  });
  
  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      if (line.includes('Local:') || line.includes('ready')) {
        log(`${colors.green}✓${colors.reset} ${exampleId}: http://localhost:${port}`);
      }
    }
  });
  
  child.stderr.on('data', (data) => {
    // Only log actual errors, not warnings
    const text = data.toString();
    if (text.includes('error') || text.includes('Error')) {
      console.error(`${colors.yellow}[${exampleId}]${colors.reset} ${text}`);
    }
  });
  
  return child;
}

async function main() {
  const args = process.argv.slice(2);
  const allExamples = findExamples(examplesDir);
  
  // Handle --list flag
  if (args.includes('--list') || args.includes('-l')) {
    listExamples(allExamples);
    process.exit(0);
  }
  
  // Require at least one example name
  if (args.length === 0) {
    log('\n❌ Error: No examples specified\n', colors.yellow);
    log('Usage:', colors.bright);
    log('  pnpm dev:examples <example-name> [example-name2 ...]');
    log('  pnpm dev:examples --list\n');
    log('Examples:', colors.cyan);
    log('  pnpm dev:examples vanilla-threejs');
    log('  pnpm dev:examples react-three-fiber vue-tresjs');
    log('  pnpm dev:examples framework-integration/vanilla-threejs\n');
    process.exit(1);
  }
  
  log('\n🚀 3Lens Example Server\n', colors.bright);
  
  // Find selected examples
  const selectedExamples = [];
  for (const arg of args) {
    const example = findExampleByQuery(allExamples, arg);
    if (example) {
      selectedExamples.push(example);
    } else {
      log(`\n❌ Example not found: ${arg}`, colors.red);
      log(`Run ${colors.cyan}pnpm dev:examples --list${colors.reset} to see available examples.\n`);
      process.exit(1);
    }
  }
  
  log(`Starting ${selectedExamples.length} example server(s)...\n`);
  
  // Start selected example servers
  const processes = [];
  for (const example of selectedExamples) {
    processes.push(await startExampleServer(example));
  }
  
  // Wait a bit for servers to start
  await new Promise(r => setTimeout(r, 3000));
  
  // Print summary
  log('\n' + '─'.repeat(50));
  log('\n📋 Example URLs:\n', colors.bright);
  for (const [id, port] of portMap.entries()) {
    log(`   ${colors.cyan}${id}${colors.reset}: http://localhost:${port}`);
  }
  log('\n');
  
  // Handle shutdown
  const shutdown = () => {
    log('\n\nShutting down example servers...', colors.yellow);
    const isWindows = process.platform === 'win32';
    
    for (const proc of processes) {
      try {
        if (isWindows && proc.pid) {
          // On Windows, use taskkill to forcefully kill the process tree without confirmation
          try {
            execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore' });
          } catch (err) {
            // Process might already be dead, try regular kill as fallback
            proc.kill('SIGKILL');
          }
        } else {
          // On Unix-like systems, use SIGKILL for forceful termination
          proc.kill('SIGKILL');
        }
      } catch (err) {
        // Ignore errors - process might already be dead
      }
    }
    // Exit immediately without waiting
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(console.error);
