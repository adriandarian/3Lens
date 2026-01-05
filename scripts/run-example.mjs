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
import { join, relative } from 'path';
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
 * Create readline interface for user input
 */
function createPrompt() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Prompt user for input
 */
function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

/**
 * Run selected examples with pnpm
 */
function runExamples(examples, alsoRunPackages = true) {
  const filters = examples.map((e) => `--filter "${e.name}"`).join(' ');
  const packagesFilter = alsoRunPackages ? "--filter './packages/**'" : '';

  console.log(
    `\n${colors.bold}${colors.green}🚀 Starting examples...${colors.reset}\n`
  );

  for (const example of examples) {
    const shortName = example.name.replace('@3lens/example-', '');
    console.log(`   ${colors.cyan}•${colors.reset} ${shortName}`);
  }
  console.log();

  const command = `pnpm ${packagesFilter} ${filters} --parallel dev`;

  const child = spawn(command, {
    shell: true,
    stdio: 'inherit',
    cwd: ROOT_DIR,
  });

  child.on('error', (err) => {
    console.error(`${colors.red}Failed to start: ${err.message}${colors.reset}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
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
      runExamples(selectedExamples);
      return;
    }
  }

  // Interactive mode
  listExamples(examples);

  console.log(`${colors.bold}${colors.magenta}How to select:${colors.reset}`);
  console.log(`  • Enter number(s) separated by spaces: ${colors.dim}1 3 5${colors.reset}`);
  console.log(`  • Enter a range: ${colors.dim}1-5${colors.reset}`);
  console.log(`  • Enter name(s): ${colors.dim}vanilla-threejs react-three-fiber${colors.reset}`);
  console.log(`  • Press ${colors.dim}Enter${colors.reset} for the default (vanilla-threejs)`);
  console.log(`  • Type ${colors.dim}q${colors.reset} to quit\n`);

  const rl = createPrompt();

  const answer = await prompt(
    rl,
    `${colors.cyan}Select example(s): ${colors.reset}`
  );

  rl.close();

  if (answer.toLowerCase() === 'q' || answer.toLowerCase() === 'quit') {
    console.log('Goodbye!');
    process.exit(0);
  }

  // Default to vanilla-threejs if empty
  const input = answer.trim() || 'vanilla-threejs';
  const selectedExamples = [];

  // Parse input
  const parts = input.split(/\s+/);

  for (const part of parts) {
    // Handle ranges like "1-5"
    if (/^\d+-\d+$/.test(part)) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end && i <= examples.length; i++) {
        if (i > 0) {
          const example = examples[i - 1];
          if (!selectedExamples.includes(example)) {
            selectedExamples.push(example);
          }
        }
      }
    } else {
      const example = findExampleByQuery(examples, part);
      if (example && !selectedExamples.includes(example)) {
        selectedExamples.push(example);
      } else if (!example) {
        console.warn(
          `${colors.yellow}Warning: Could not find example "${part}", skipping...${colors.reset}`
        );
      }
    }
  }

  if (selectedExamples.length === 0) {
    console.error(`${colors.red}No valid examples selected.${colors.reset}`);
    process.exit(1);
  }

  runExamples(selectedExamples);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
