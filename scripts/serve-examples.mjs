#!/usr/bin/env node
/**
 * Serve examples during development
 * 
 * This script starts development servers for examples
 * that can be embedded in the VitePress docs.
 * 
 * Usage:
 *   pnpm dev:examples
 *   node scripts/serve-examples.mjs
 */

import { spawn } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const examplesDir = join(rootDir, 'examples');

// Port allocation starts at 5173
let nextPort = 5173;
const portMap = new Map();

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
 * Recursively find example directories
 */
function findExamples(dir, examples = []) {
  const entries = readdirSync(dir);
  
  const hasPackageJson = entries.includes('package.json');
  const hasViteConfig = entries.some(e => e.startsWith('vite.config'));
  
  if (hasPackageJson && hasViteConfig) {
    examples.push(dir);
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
  
  return examples;
}

/**
 * Start a development server for an example
 */
function startExampleServer(examplePath) {
  const exampleId = relative(examplesDir, examplePath).replace(/\\/g, '/');
  const port = nextPort++;
  
  portMap.set(exampleId, port);
  
  log(`\n${colors.cyan}[${exampleId}]${colors.reset} Starting on port ${port}...`);
  
  const child = spawn('pnpm', ['vite', '--port', port.toString(), '--strictPort'], {
    cwd: examplePath,
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
  log('\n🚀 3Lens Example Server\n', colors.bright);
  
  const examples = findExamples(examplesDir);
  log(`Found ${examples.length} examples\n`);
  
  // Start all example servers
  const processes = [];
  for (const example of examples.slice(0, 5)) { // Limit to 5 for dev
    processes.push(startExampleServer(example));
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
  process.on('SIGINT', () => {
    log('\n\nShutting down example servers...', colors.yellow);
    for (const proc of processes) {
      proc.kill();
    }
    process.exit(0);
  });
}

main().catch(console.error);
