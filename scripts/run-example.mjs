#!/usr/bin/env node

/**
 * Interactive example runner for 3Lens
 *
 * Usage:
 *   pnpm example              - Interactive menu to select example(s)
 *   pnpm example:list         - List all available examples
 *   pnpm example <name>       - Run a specific example by name
 *   pnpm example <n1> <n2>    - Run multiple examples
 */

import { readdirSync, statSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const EXAMPLES_DIR = join(ROOT_DIR, 'examples');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

/**
 * Recursively find all examples with package.json files
 */
function findExamples(dir, basePath = '') {
  const examples = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const relativePath = basePath ? `${basePath}/${entry}` : entry;

      if (!statSync(fullPath).isDirectory()) continue;
      if (entry.startsWith('.') || entry === 'node_modules') continue;

      const packageJsonPath = join(fullPath, 'package.json');

      if (existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          if (pkg.scripts?.dev) {
            examples.push({
              name: pkg.name || entry,
              path: relativePath,
              fullPath,
              description: pkg.description || '',
            });
          }
        } catch {
          // Skip invalid package.json
        }
      } else {
        // Recurse into subdirectories
        examples.push(...findExamples(fullPath, relativePath));
      }
    }
  } catch {
    // Directory doesn't exist or isn't readable
  }

  return examples;
}

/**
 * Display the list of available examples
 */
function listExamples(examples) {
  console.log(
    `\n${colors.bold}${colors.cyan}📦 Available 3Lens Examples${colors.reset}\n`
  );

  // Group by category (first directory)
  const grouped = {};
  for (const example of examples) {
    const category = example.path.split('/')[0];
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(example);
  }

  let index = 1;
  for (const [category, categoryExamples] of Object.entries(grouped)) {
    console.log(
      `${colors.bold}${colors.yellow}${formatCategory(category)}${colors.reset}`
    );

    for (const example of categoryExamples) {
      const shortName = example.name.replace('@3lens/example-', '');
      console.log(
        `  ${colors.dim}${String(index).padStart(2)}.${colors.reset} ${colors.green}${shortName}${colors.reset}`
      );
      if (example.description) {
        console.log(`      ${colors.dim}${example.description}${colors.reset}`);
      }
      index++;
    }
    console.log();
  }

  return grouped;
}

/**
 * Format category name for display
 */
function formatCategory(name) {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Interactive TUI for selecting examples using Bubble Tea (via Go binary)
 */
async function interactiveSelect(examples) {
  // Check if stdin is a TTY (interactive terminal)
  if (!process.stdin.isTTY) {
    console.error(
      `${colors.red}Error: Interactive mode requires a TTY terminal.${colors.reset}\n` +
      `Please run this command in an interactive terminal.\n`
    );
    process.exit(1);
  }

  // Serialize examples to JSON for the Go program
  const examplesJson = JSON.stringify(examples.map((ex, idx) => ({
    index: idx + 1,
    name: ex.name,
    shortName: ex.name.replace('@3lens/example-', ''),
    category: ex.path.split('/')[0],
    categoryName: formatCategory(ex.path.split('/')[0]),
    description: ex.description || '',
    path: ex.path,
  })));

  // Use a temporary file instead of environment variable (more reliable, especially on Windows)
  const { writeFileSync, unlinkSync } = await import('fs');
  const tmpFile = join(__dirname, `.tui-examples-${Date.now()}.json`);
  
  try {
    writeFileSync(tmpFile, examplesJson, 'utf-8');
  } catch (err) {
    console.error(`${colors.red}Failed to create temporary file: ${err.message}${colors.reset}`);
    process.exit(1);
  }

  // Call the Go Bubble Tea binary
  const { execSync, spawn } = await import('child_process');
  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'tui-selector.exe' : 'tui-selector';
  const goBinaryPath = join(__dirname, binaryName);
  
  try {
    // Check if Go binary exists, if not, try to build it
    if (!existsSync(goBinaryPath)) {
      console.log(
        `${colors.yellow}Building Bubble Tea TUI binary...${colors.reset}\n`
      );
      try {
        // Try to build the Go binary
        execSync('go build -o ' + binaryName + ' tui-selector.go', {
          cwd: __dirname,
          stdio: 'inherit',
        });
      } catch (buildError) {
        console.error(
          `${colors.red}Failed to build Go TUI binary.${colors.reset}\n` +
          `${colors.yellow}Please ensure Go is installed and run:${colors.reset}\n` +
          `  ${colors.cyan}cd scripts && go mod tidy && go build -o ${binaryName} tui-selector.go${colors.reset}\n`
        );
        process.exit(1);
      }
    }

    // Use spawn for interactive TUI
    // Pass JSON file path and result file path via environment variables
    // Use 'inherit' for all stdio so TUI can render directly to terminal
    const resultFile = join(__dirname, `.tui-result-${Date.now()}.json`);
    
    return new Promise((resolve, reject) => {
      const child = spawn(goBinaryPath, [], {
        stdio: 'inherit', // All streams inherit so TUI can render to terminal
        cwd: __dirname,
        env: {
          ...process.env,
          EXAMPLES_JSON_FILE: tmpFile,
          RESULT_FILE: resultFile,
        },
      });

      child.on('close', (code) => {
        // Clean up temporary input file
        try {
          if (existsSync(tmpFile)) {
            unlinkSync(tmpFile);
          }
        } catch (err) {
          // Ignore cleanup errors
        }

        if (code !== 0 && code !== null) {
          // Clean up result file if it exists
          try {
            if (existsSync(resultFile)) {
              unlinkSync(resultFile);
            }
          } catch (err) {
            // Ignore cleanup errors
          }

          if (code === 130 || code === 1) {
            // Ctrl+C or user cancellation
            console.log(`\n${colors.yellow}Selection cancelled. Goodbye!${colors.reset}`);
            process.exit(0);
          }
          reject(new Error(`Go TUI exited with code ${code}`));
          return;
        }

        // Read results from file
        let selectedIndices = [];
        try {
          if (existsSync(resultFile)) {
            const resultData = readFileSync(resultFile, 'utf-8');
            selectedIndices = resultData.trim().split('\n')
              .filter(line => line.trim())
              .map(line => parseInt(line.trim(), 10) - 1)
              .filter(idx => idx >= 0 && idx < examples.length);
            
            // Clean up result file
            unlinkSync(resultFile);
          }
        } catch (err) {
          // If result file doesn't exist or can't be read, user likely cancelled
        }

        if (selectedIndices.length === 0) {
          console.log(`\n${colors.yellow}No examples selected. Goodbye!${colors.reset}`);
          process.exit(0);
        }

        // Map indices back to example objects
        resolve(selectedIndices.map(idx => examples[idx]));
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    // Handle Ctrl+C gracefully
    if (error.signal === 'SIGINT' || error.code === 130) {
      console.log(`\n${colors.yellow}Selection cancelled. Goodbye!${colors.reset}`);
      process.exit(0);
    }
    // Re-throw unexpected errors
    throw error;
  }
}

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

/**
 * Parse dev script and extract command and arguments
 */
function parseDevScript(devScript) {
  // Handle different dev command formats
  const parts = devScript.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  
  return { command, args };
}

/**
 * Override port in command arguments or add it
 */
function overridePort(command, args, port) {
  const newArgs = [...args];
  
  // Remove existing port arguments
  const portPatterns = [
    /^--port$/,
    /^-p$/,
    /^--port=\d+$/,
    /^-p=\d+$/,
  ];
  
  const filteredArgs = [];
  for (let i = 0; i < newArgs.length; i++) {
    const arg = newArgs[i];
    const isPortFlag = portPatterns.some(pattern => pattern.test(arg));
    const isPortValue = i > 0 && portPatterns.some(pattern => pattern.test(newArgs[i - 1]));
    
    if (!isPortFlag && !isPortValue) {
      filteredArgs.push(arg);
    }
  }
  
  // Add new port argument based on command
  if (command === 'vite') {
    filteredArgs.push('--port', port.toString(), '--strictPort', '--no-open');
  } else if (command === 'next') {
    // Next.js doesn't auto-open by default, but we can explicitly disable it
    filteredArgs.push('-p', port.toString());
  } else if (command === 'ng') {
    // Angular CLI: use --no-open flag
    filteredArgs.push('--port', port.toString(), '--no-open');
  } else {
    // Generic fallback - try --port
    filteredArgs.push('--port', port.toString());
  }
  
  return filteredArgs;
}

/**
 * Run selected examples with dynamically assigned ports
 * Examples use built packages or source aliases - they don't need packages in watch mode
 */
async function runExamples(examples, alsoRunPackages = false) {
  console.log(
    `\n${colors.bold}${colors.green}🚀 Starting examples...${colors.reset}\n`
  );

  // Assign ports starting from 3000
  let nextPort = 3000;
  const processes = [];
  const portMap = new Map();

  for (const example of examples) {
    const shortName = example.name.replace('@3lens/example-', '');
    
    // Find available port
    const port = await findAvailablePort(nextPort);
    portMap.set(example.name, port);
    nextPort = port + 1;
    
    // Read package.json to get dev script
    const packageJsonPath = join(example.fullPath, 'package.json');
    let devScript = 'vite'; // default
    
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      if (pkg.scripts?.dev) {
        devScript = pkg.scripts.dev;
      }
    } catch (err) {
      console.warn(`${colors.yellow}Warning: Could not read package.json for ${example.name}${colors.reset}`);
    }
    
    // Parse dev script
    const { command, args } = parseDevScript(devScript);
    const finalArgs = overridePort(command, args, port);
    
    console.log(`   ${colors.cyan}•${colors.reset} ${shortName} on port ${colors.green}${port}${colors.reset}`);
    
    // Spawn the dev process
    const child = spawn(command, finalArgs, {
      cwd: example.fullPath,
      stdio: 'inherit',
      shell: true,
    });
    
    child.on('error', (err) => {
      console.error(`${colors.red}Failed to start ${shortName}: ${err.message}${colors.reset}`);
    });
    
    processes.push({ child, example: shortName, port });
  }
  
  console.log();
  
  // Print summary after a short delay
  setTimeout(() => {
    console.log('\n' + '─'.repeat(50));
    console.log(`\n${colors.bold}📋 Example URLs:\n${colors.reset}`);
    for (const [name, port] of portMap.entries()) {
      const shortName = name.replace('@3lens/example-', '');
      console.log(`   ${colors.cyan}${shortName}${colors.reset}: http://localhost:${port}`);
    }
    console.log('\n');
  }, 2000);

  // Handle shutdown
  const shutdown = () => {
    console.log(`\n${colors.yellow}Shutting down example servers...${colors.reset}`);
    const isWindows = process.platform === 'win32';
    
    for (const { child } of processes) {
      try {
        if (isWindows && child.pid) {
          // On Windows, use taskkill to forcefully kill the process tree without confirmation
          try {
            execSync(`taskkill /F /T /PID ${child.pid}`, { stdio: 'ignore' });
          } catch (err) {
            // Process might already be dead, try regular kill as fallback
            child.kill('SIGKILL');
          }
        } else {
          // On Unix-like systems, use SIGKILL for forceful termination
          child.kill('SIGKILL');
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

  // Wait for all processes
  Promise.all(processes.map(({ child }) => 
    new Promise((resolve) => {
      child.on('exit', resolve);
    })
  )).then(() => {
    process.exit(0);
  });
}

/**
 * Find example by name or number
 */
function findExampleByQuery(examples, query) {
  // Try as number first
  const num = parseInt(query, 10);
  if (!isNaN(num) && num > 0 && num <= examples.length) {
    return examples[num - 1];
  }

  // Try as exact name match
  const exactMatch = examples.find(
    (e) =>
      e.name === query ||
      e.name === `@3lens/example-${query}` ||
      e.path.endsWith(query)
  );
  if (exactMatch) return exactMatch;

  // Try as partial match
  const partialMatches = examples.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.path.toLowerCase().includes(query.toLowerCase())
  );

  if (partialMatches.length === 1) return partialMatches[0];
  if (partialMatches.length > 1) {
    console.log(
      `${colors.yellow}Multiple matches found for "${query}":${colors.reset}`
    );
    partialMatches.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name}`);
    });
    return null;
  }

  return null;
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const examples = findExamples(EXAMPLES_DIR);

  if (examples.length === 0) {
    console.error(
      `${colors.red}No examples found in ${EXAMPLES_DIR}${colors.reset}`
    );
    process.exit(1);
  }

  // Handle --list flag
  if (args.includes('--list') || args.includes('-l')) {
    listExamples(examples);
    process.exit(0);
  }

  // Handle direct example name(s) as arguments
  if (args.length > 0 && !args[0].startsWith('-')) {
    const selectedExamples = [];

    for (const arg of args) {
      const example = findExampleByQuery(examples, arg);
      if (example) {
        selectedExamples.push(example);
      } else {
        console.error(
          `${colors.red}Example not found: ${arg}${colors.reset}`
        );
        console.log(`Run ${colors.cyan}pnpm example:list${colors.reset} to see available examples.\n`);
        process.exit(1);
      }
    }

    if (selectedExamples.length > 0) {
      await runExamples(selectedExamples);
      return;
    }
  }

  // Interactive TUI mode
  const selectedExamples = await interactiveSelect(examples);
  
  if (selectedExamples.length === 0) {
    console.error(`${colors.red}No examples selected.${colors.reset}`);
    process.exit(1);
  }

  await runExamples(selectedExamples);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
