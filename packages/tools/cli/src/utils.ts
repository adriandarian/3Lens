/**
 * CLI Utilities
 *
 * Utility functions for the 3Lens CLI.
 *
 * @packageDocumentation
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve, isAbsolute } from 'node:path';

/**
 * Color codes for terminal output
 */
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Print styled text
 */
export function print(message: string, color?: keyof typeof colors): void {
  if (color) {
    console.log(`${colors[color]}${message}${colors.reset}`);
  } else {
    console.log(message);
  }
}

/**
 * Print an error message
 */
export function printError(message: string): void {
  console.error(`${colors.red}Error: ${message}${colors.reset}`);
}

/**
 * Print a success message
 */
export function printSuccess(message: string): void {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Print a warning message
 */
export function printWarning(message: string): void {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

/**
 * Print an info message
 */
export function printInfo(message: string): void {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

/**
 * Print a table
 */
export function printTable(headers: string[], rows: string[][]): void {
  // Calculate column widths
  const widths = headers.map((h, i) => {
    const colValues = [h, ...rows.map((r) => r[i] || '')];
    return Math.max(...colValues.map((v) => v.length));
  });

  // Print header
  const headerRow = headers.map((h, i) => h.padEnd(widths[i])).join('  ');
  console.log(`${colors.bold}${headerRow}${colors.reset}`);
  console.log('-'.repeat(headerRow.length));

  // Print rows
  for (const row of rows) {
    const rowStr = row.map((cell, i) => (cell || '').padEnd(widths[i])).join('  ');
    console.log(rowStr);
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(unitIndex > 0 ? 2 : 0)} ${units[unitIndex]}`;
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

/**
 * Read a JSON file
 */
export function readJsonFile<T>(path: string): T {
  const resolved = resolvePath(path);
  if (!existsSync(resolved)) {
    throw new Error(`File not found: ${path}`);
  }
  const content = readFileSync(resolved, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Write a JSON file
 */
export function writeJsonFile(path: string, data: unknown): void {
  const resolved = resolvePath(path);
  const dir = dirname(resolved);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(resolved, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Resolve a path relative to cwd
 */
export function resolvePath(path: string): string {
  if (isAbsolute(path)) {
    return path;
  }
  return resolve(process.cwd(), path);
}

/**
 * Check if a file exists
 */
export function fileExists(path: string): boolean {
  return existsSync(resolvePath(path));
}

/**
 * Simple spinner for async operations
 */
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private message: string;

  constructor(message: string) {
    this.message = message;
  }

  start(): void {
    this.intervalId = setInterval(() => {
      process.stdout.write(`\r${colors.cyan}${this.frames[this.frameIndex]}${colors.reset} ${this.message}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 80);
  }

  stop(success = true): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    const icon = success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    process.stdout.write(`\r${icon} ${this.message}\n`);
  }

  update(message: string): void {
    this.message = message;
  }
}

/**
 * Prompt for confirmation (returns immediately in non-interactive mode)
 */
export async function confirm(message: string): Promise<boolean> {
  // In non-interactive mode, default to yes
  if (!process.stdin.isTTY) {
    return true;
  }

  return new Promise((resolve) => {
    process.stdout.write(`${message} (y/n) `);

    const handler = (data: Buffer) => {
      const input = data.toString().trim().toLowerCase();
      process.stdin.removeListener('data', handler);
      process.stdin.pause();
      resolve(input === 'y' || input === 'yes');
    };

    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', handler);
  });
}
