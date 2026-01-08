#!/usr/bin/env node
/**
 * Build all examples for deployment alongside docs
 * 
 * This script:
 * 1. Discovers all examples in the examples/ directory
 * 2. Builds each example with Vite
 * 3. Copies the built output to docs/public/examples/
 * 
 * Usage:
 *   pnpm build:examples
 *   node scripts/build-examples.mjs
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync, cpSync, rmSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');
const examplesDir = join(rootDir, 'examples');
const outputDir = join(rootDir, 'docs', 'public', 'examples');

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
}

/**
 * Recursively find all example directories (those with package.json and vite.config)
 */
function findExamples(dir, examples = []) {
  const entries = readdirSync(dir);
  
  // Check if this directory is an example
  const hasPackageJson = entries.includes('package.json');
  const hasViteConfig = entries.some(e => e.startsWith('vite.config'));
  
  if (hasPackageJson && hasViteConfig) {
    examples.push(dir);
    return examples; // Don't recurse into example subdirectories
  }
  
  // Recurse into subdirectories
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
 * Get the relative path from examples directory for output structure
 */
function getExampleId(examplePath) {
  return relative(examplesDir, examplePath).replace(/\\/g, '/');
}

/**
 * Build a single example
 */
function buildExample(examplePath) {
  const exampleId = getExampleId(examplePath);
  const outputPath = join(outputDir, exampleId);
  
  logStep('BUILD', `Building ${exampleId}...`);
  
  try {
    // Install dependencies if needed
    if (!existsSync(join(examplePath, 'node_modules'))) {
      logStep('INSTALL', `Installing dependencies for ${exampleId}...`);
      execSync('pnpm install', { 
        cwd: examplePath, 
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });
    }
    
    // Build the example with custom base path
    const basePath = `/examples/${exampleId}/`;
    execSync(`pnpm vite build --base=${basePath}`, { 
      cwd: examplePath, 
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });
    
    // Copy dist to output directory
    const distPath = join(examplePath, 'dist');
    if (existsSync(distPath)) {
      mkdirSync(outputPath, { recursive: true });
      cpSync(distPath, outputPath, { recursive: true });
      logSuccess(`Built ${exampleId} → ${relative(rootDir, outputPath)}`);
      return true;
    } else {
      logError(`No dist folder found for ${exampleId}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to build ${exampleId}: ${error.message}`);
    return false;
  }
}

/**
 * Main build function
 */
async function main() {
  const args = process.argv.slice(2);
  const specificExample = args[0];
  
  log('\n🔧 3Lens Examples Builder\n', colors.bright);
  
  // Clean output directory
  if (existsSync(outputDir)) {
    logStep('CLEAN', 'Removing old built examples...');
    rmSync(outputDir, { recursive: true });
  }
  mkdirSync(outputDir, { recursive: true });
  
  // Find all examples
  logStep('SCAN', 'Discovering examples...');
  const examples = findExamples(examplesDir);
  log(`   Found ${examples.length} examples\n`);
  
  // Filter if specific example requested
  const toBuild = specificExample 
    ? examples.filter(e => getExampleId(e).includes(specificExample))
    : examples;
  
  if (toBuild.length === 0) {
    logError(`No examples found${specificExample ? ` matching "${specificExample}"` : ''}`);
    process.exit(1);
  }
  
  // Build each example
  let successful = 0;
  let failed = 0;
  
  for (const example of toBuild) {
    if (buildExample(example)) {
      successful++;
    } else {
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '─'.repeat(50));
  log(`\n📊 Build Summary:`, colors.bright);
  log(`   ${colors.green}✓ Successful: ${successful}${colors.reset}`);
  if (failed > 0) {
    log(`   ${colors.red}✗ Failed: ${failed}${colors.reset}`);
  }
  log(`   📁 Output: ${relative(rootDir, outputDir)}\n`);
  
  // Create an index of all examples
  const exampleIndex = toBuild
    .filter(e => existsSync(join(outputDir, getExampleId(e), 'index.html')))
    .map(e => ({
      id: getExampleId(e),
      path: `/examples/${getExampleId(e)}/`,
      name: getExampleId(e).split('/').pop()
    }));
  
  // Write index file
  const indexPath = join(outputDir, 'index.json');
  const { writeFileSync } = await import('fs');
  writeFileSync(indexPath, JSON.stringify(exampleIndex, null, 2));
  logSuccess(`Created examples index: ${relative(rootDir, indexPath)}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  logError(error.message);
  process.exit(1);
});
